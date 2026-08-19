import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {hydrateRemoteState} from './lib/remoteStore';

async function bootstrap() {
  try {
    await hydrateRemoteState();
  } catch (error) {
    // Cloud sync must never prevent the public website from rendering.
    console.error('[Aliens] cloud bootstrap failed; continuing with local cache:', error);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
