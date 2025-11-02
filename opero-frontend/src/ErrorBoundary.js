// #####################################################################
// # File: src/ErrorBoundary.js
// # Scopo: Cattura gli errori JavaScript (crash) dell'app
// # e li mostra sullo schermo invece di una schermata bianca.
// #####################################################################
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Aggiorna lo stato così che il prossimo render mostri la UI di fallback.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // Puoi anche loggare l'errore a un servizio di reportistica
    console.error("Errore CATTURATO DALLA TRAPPOLA:", error, errorInfo);
    this.setState({ errorInfo: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // UI di Fallback personalizzata
      return (
        <div style={{ padding: '20px', backgroundColor: 'white', color: 'red', height: '100vh', overflow: 'auto' }}>
          <h1>Qualcosa è andato storto.</h1>
          <p>L'app non può avviarsi.</p>
          <hr />
          <h2>Errore:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error ? this.state.error.toString() : 'Nessun messaggio di errore.'}
          </pre>
          <hr />
          <h2>Stack Trace:</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.errorInfo ? this.state.errorInfo.componentStack : 'Nessuno stack trace.'}
          </pre>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;