import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/accessibility.css';

/**
 * Mount the pronator React app into `container`.
 * Called by PronatorView.vue after the host element is in the DOM.
 */
export function init(container: HTMLElement) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
