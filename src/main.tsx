import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSchoolTheme } from './utils/themeManager';

// Initialize school primary theme color, meta tag, and CSS variables immediately
initSchoolTheme();

createRoot(document.getElementById('root')!).render(<App />);
