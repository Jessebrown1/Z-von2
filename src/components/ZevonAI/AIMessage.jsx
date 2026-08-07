import AIProductRecommendation from './AIProductRecommendation';

export default function AIMessage({ message, onAddProduct, onAddLook, onQuickReply, isAuthenticated }) {
  const isUser = message.role === 'user';

  return (
    <div className={`ai-message ${isUser ? 'ai-message--user' : 'ai-message--ai'}`}>
      <div className="ai-message-bubble">{message.text}</div>

      {message.blocks?.map((block, index) => {
        if (block.type === 'quick-replies') {
          return (
            <div className="ai-quick-replies" key={index}>
              {block.options?.map((option) => (
                <button key={option.tag || option.slug} type="button" onClick={() => onQuickReply(option.label)}>
                  {option.label}
                </button>
              ))}
            </div>
          );
        }

        return (
          <AIProductRecommendation
            key={index}
            block={block}
            onAddProduct={onAddProduct}
            onAddLook={onAddLook}
            isAuthenticated={isAuthenticated}
          />
        );
      })}
    </div>
  );
}
