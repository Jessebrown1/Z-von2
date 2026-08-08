import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled render error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--bg-surface, #0a0a0a)',
          color: 'var(--text-primary, #f5f5f0)',
        }}
      >
        <h1 style={{ fontFamily: 'var(--font-serif, serif)', fontSize: '1.5rem', margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--text-secondary, #999)', maxWidth: '32ch' }}>
          Please reload the page. If this keeps happening, try again in a different browser.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '999px',
            border: '1px solid var(--accent, #c9a961)',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
