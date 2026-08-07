import { useEffect, useRef, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { processMessage, createConversationState, getQuickPrompts } from './aiEngine';
import AIMessage from './AIMessage';
import AIOutfitBuilder from './AIOutfitBuilder';

const GREETING = "I'm ZÉVON AI — your personal stylist. Tell me what you're looking for, or how you want to feel.";

export default function AIChat({ products, styleDna, isOpen, pendingMessage, onConsumePendingMessage }) {
  const [messages, setMessages] = useState([{ role: 'ai', text: GREETING, blocks: [] }]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [convState, setConvState] = useState(createConversationState());
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // A search bar (or anything else outside the panel) can open ZÉVON AI with
  // a starting message queued — send it once, then clear so it can't replay.
  useEffect(() => {
    if (isOpen && pendingMessage) {
      send(pendingMessage);
      onConsumePendingMessage?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pendingMessage]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isThinking]);

  const send = (rawText) => {
    const userText = (rawText ?? input).trim();
    if (!userText || isThinking) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText, blocks: [] }]);
    setIsThinking(true);

    // A brief, deliberate pause reads as "thinking" rather than an instant
    // keyword-matcher — the whole point is that it shouldn't feel mechanical.
    const delay = 350 + Math.random() * 350;
    window.setTimeout(() => {
      const result = processMessage({ message: userText, products, state: convState, styleDna });
      setConvState(result.state);
      setMessages((prev) => [...prev, { role: 'ai', text: result.replyText, blocks: result.blocks }]);
      setIsThinking(false);
    }, delay);
  };

  const addProductToCart = (product) => {
    if (!isAuthenticated || !product) return;
    addItem(product, { size: product.sizes?.[0] || '', color: product.colors?.[0] || '', quantity: 1 });
  };

  const addLookToCart = (slots) => {
    if (!isAuthenticated) return;
    Object.values(slots)
      .filter(Boolean)
      .forEach((product) => addProductToCart(product));
  };

  return (
    <div className="ai-chat">
      {/* data-lenis-prevent: Lenis (global smooth-scroll) hijacks wheel input
          by default and would otherwise scroll the page behind this panel
          instead of the message list — this attribute makes Lenis back off
          and let the browser scroll this element natively. */}
      <div className="ai-chat-messages" ref={listRef} data-lenis-prevent>
        {messages.map((message, index) => (
          <AIMessage
            key={index}
            message={message}
            onAddProduct={addProductToCart}
            onAddLook={addLookToCart}
            onQuickReply={send}
            isAuthenticated={isAuthenticated}
          />
        ))}
        {isThinking && (
          <div className="ai-message ai-message--ai">
            <div className="ai-message-bubble ai-message-bubble--thinking">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>

      {messages.length === 1 && (
        <div className="ai-chat-quick-prompts">
          <AIOutfitBuilder onStart={send} />
          {getQuickPrompts().map((prompt) => (
            <button key={prompt} type="button" onClick={() => send(prompt)}>
              {prompt}
            </button>
          ))}
        </div>
      )}

      <form
        className="ai-chat-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell ZÉVON what you're looking for…"
          aria-label="Message ZÉVON AI"
        />
        <button type="submit" className="ai-chat-send" aria-label="Send" disabled={!input.trim() || isThinking}>
          &rarr;
        </button>
      </form>
    </div>
  );
}
