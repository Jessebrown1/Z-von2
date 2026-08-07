const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let scriptPromise = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load Google Sign-In.'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Renders Google's own "Sign in with Google" button into `container`.
 * `onCredential` is called with the ID token JWT once the customer picks an
 * account — send that straight to /api/auth/google for server-side
 * verification, never trust it unverified.
 */
export async function renderGoogleButton(container, { clientId, onCredential }) {
  if (!clientId || !container) return;

  await loadGoogleScript();

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => onCredential(response.credential),
  });

  window.google.accounts.id.renderButton(container, {
    theme: 'outline',
    size: 'large',
    shape: 'pill',
    text: 'continue_with',
    width: container.offsetWidth || 360,
  });
}
