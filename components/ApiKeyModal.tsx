import React, { useState } from 'react';

interface ApiKeyModalProps {
  onKeySubmit: (key: string) => void;
  onViewOnly: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySubmit, onViewOnly }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onKeySubmit(apiKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-8 max-w-lg w-full text-center text-gray-200">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to the LLM Chaining Explorer</h1>
        <p className="mb-6 text-gray-400">To run the interactive demos, please enter your Gemini API key.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Enter your Gemini API key..."
            aria-label="Gemini API Key"
          />
          <button
            type="submit"
            disabled={!apiKey.trim()}
            className="w-full px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
          >
            Save & Start Exploring
          </button>
        </form>

        <div className="mt-6">
          <button onClick={onViewOnly} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Continue without API key (view-only)
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-left text-sm">
          <h2 className="font-semibold text-gray-300 mb-2">How to get an API key:</h2>
          <ol className="list-decimal list-inside text-gray-400 space-y-1">
            <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a>.</li>
            <li>Click on "Create API key".</li>
            <li>Copy the generated key and paste it above.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
