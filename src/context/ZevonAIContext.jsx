import { createContext, useContext, useMemo, useState } from 'react';

const ZevonAIContext = createContext(null);

/**
 * Lets things outside the ZÉVON AI panel (like the navbar search bar) open
 * it and hand off a starting message — e.g. "Ask ZÉVON AI" for a query that
 * didn't match anything by plain search.
 */
export function ZevonAIProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);

  const value = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      pendingMessage,
      clearPendingMessage: () => setPendingMessage(null),
      openWithMessage: (message) => {
        setPendingMessage(message);
        setIsOpen(true);
      },
    }),
    [isOpen, pendingMessage]
  );

  return <ZevonAIContext.Provider value={value}>{children}</ZevonAIContext.Provider>;
}

export function useZevonAI() {
  const ctx = useContext(ZevonAIContext);
  if (!ctx) throw new Error('useZevonAI must be used within a ZevonAIProvider');
  return ctx;
}
