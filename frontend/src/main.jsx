import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'aos/dist/aos.css';
import 'react-photo-view/dist/react-photo-view.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/global.css';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
