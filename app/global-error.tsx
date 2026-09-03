'use client';

// Last-resort boundary: only fires when the root layout itself throws. It
// replaces the root layout, so it must ship its own <html>/<body> and cannot
// rely on the app's fonts or global stylesheet.

import { useEffect } from 'react';

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}): React.JSX.Element {
  useEffect(() => {
    console.error('[global] fatal error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#f8f2e9',
          color: '#2f210f',
          fontFamily: 'Georgia, "Times New Roman", serif',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '28rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ marginTop: '0.75rem', lineHeight: 1.6 }}>
            The site hit an unexpected error. Please try again.
          </p>
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 2rem',
              border: '1px solid rgba(47, 33, 15, 0.5)',
              borderRadius: '4px',
              background: '#2f210f',
              color: '#f8f2e9',
              font: 'inherit',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
