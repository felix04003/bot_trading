import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app.jsx';

// Création de l'élément root
const container = document.getElementById('root');
const root = createRoot(container);

// Rendu de l'application
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
); 