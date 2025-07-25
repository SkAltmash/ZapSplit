import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <App />
    </BrowserRouter>
  </StrictMode>
);
