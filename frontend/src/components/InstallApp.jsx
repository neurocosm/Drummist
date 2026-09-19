import React, { useEffect, useState } from 'react';

export default function InstallApp() {
  const [prompt, setPrompt] = useState(null);
  const [status, setStatus] = useState('');
  const [update, setUpdate] = useState(null);
  const [installed, setInstalled] = useState(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    const onPrompt = event => { event.preventDefault(); setPrompt(event); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    let cancelled = false;
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      setStatus('Preparing offline drums…');
      navigator.serviceWorker.register('/service-worker.js').then(registration => {
        if (cancelled) return;
        if (registration.waiting) setUpdate(registration.waiting);
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => {
            if (cancelled) return;
            if (worker.state === 'installed' && navigator.serviceWorker.controller) setUpdate(worker);
            if (worker.state === 'redundant') setStatus('Offline setup failed. Reopen while online to retry.');
          });
        });
        navigator.serviceWorker.ready.then(() => { if (!cancelled) setStatus('Ready offline · All kits included'); });
      }).catch(() => { if (!cancelled) setStatus('Offline setup unavailable. Reopen while online to retry.'); });
    }
    return () => {
      cancelled = true;
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);
  const install = async () => {
    if (!prompt) { setHelp(!help); return; }
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  };
  return (
    <aside className="bg-blue-50 border-b border-blue-100 px-4 py-3 text-center text-sm text-blue-900">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <span role="status">{status || 'Take Drummist with you'}</span>
        {!installed && <button className="font-semibold underline underline-offset-4" onClick={install}>Install Drummist</button>}
        {update && <button className="font-semibold underline" onClick={() => {
          navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
          update.postMessage('ACTIVATE_UPDATE');
        }}>Update available — save your beat, then reload</button>}
      </div>
      {help && <p className="mt-2">In Chrome or Edge, use the browser menu’s install option. On iPhone or iPad, open in Safari and choose Share → Add to Home Screen. If this preview browser cannot install apps, open the same address in your regular browser.</p>}
    </aside>
  );
}
