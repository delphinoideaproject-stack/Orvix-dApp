import './fetch-polyfill';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Web3Provider } from './lib/web3.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Web3Provider>
        <App />
      </Web3Provider>
    </ErrorBoundary>
  </StrictMode>
);



