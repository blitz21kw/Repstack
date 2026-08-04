import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import './index.css';
import App from './App.tsx';
import './ui-upgrade.css';
import { initializeDatabase } from './db/index.ts';

// Register service worker with auto-update. Installed PWAs should not stay on
// an older navigation shell after a deployment.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    void updateSW(true);
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegisteredSW(swUrl, registration) {
    // Check periodically and whenever the app becomes active again. This is
    // especially important for an app opened from an iPhone home-screen icon.
    if (registration) {
      const checkForUpdates = () => {
        void registration.update();
      };

      setInterval(checkForUpdates, 15 * 60 * 1000);

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkForUpdates();
        }
      });
      window.addEventListener('online', checkForUpdates);
    }
    console.log('Service worker registered:', swUrl);
  },
});

// Initialize database with error recovery before rendering
initializeDatabase()
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    // Still render the app - it may show errors but at least shows something
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  });
