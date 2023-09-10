import React from 'react';
import { createRoot } from 'react-dom/client'; // Importa createRoot
import './index.css';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#2196f3', // Cambia esto al color principal que prefieras
        },
    },
});

const root = createRoot(document.getElementById('root')); // Crea el root utilizando createRoot
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);
