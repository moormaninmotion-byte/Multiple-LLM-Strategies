import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ApiKeyModal from './components/ApiKeyModal';

const AppWrapper = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => sessionStorage.getItem('gemini-api-key'));
  const [viewOnly, setViewOnly] = useState<boolean>(() => !!sessionStorage.getItem('view-only-mode'));

  const handleKeySubmit = (key: string) => {
    sessionStorage.setItem('gemini-api-key', key);
    sessionStorage.removeItem('view-only-mode'); // Clear view-only if key is provided
    setApiKey(key);
    setViewOnly(false);
  };

  const handleViewOnly = () => {
    sessionStorage.setItem('view-only-mode', 'true');
    sessionStorage.removeItem('gemini-api-key'); // Clear key if view-only
    setApiKey(null);
    setViewOnly(true);
  };

  if (apiKey || viewOnly) {
    return <App apiKey={apiKey} />;
  }
  
  return <ApiKeyModal onKeySubmit={handleKeySubmit} onViewOnly={handleViewOnly} />;
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
