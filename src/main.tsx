import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { ErrorBoundary } from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AudioPlayerProvider>
        <App />
      </AudioPlayerProvider>
    </ErrorBoundary>
  </StrictMode>,
);
