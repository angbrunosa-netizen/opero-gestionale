import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext'; // 1. Importa la "centrale elettrica"
import ErrorBoundary from './ErrorBoundary'; // <-- 1. IMPORTA LA TRAPPOLA
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary> {/* <-- 2. AVVOLGI TUTTO */}
    <AuthProvider>
      <App />
    </AuthProvider>
    </ErrorBoundary> {/* <-- 3. CHIUDI LA TRAPPOLA */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
