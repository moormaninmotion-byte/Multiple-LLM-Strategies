
import React, { useState, useMemo } from 'react';
import { STRATEGIES } from './constants';
import type { StrategyId } from './types';
import CodeBlock from './components/CodeBlock';

const App: React.FC = () => {
  const [activeStrategyId, setActiveStrategyId] = useState<StrategyId>(STRATEGIES[0].id);

  const activeStrategy = useMemo(() => {
    return STRATEGIES.find(s => s.id === activeStrategyId)!;
  }, [activeStrategyId]);

  const DemoComponent = activeStrategy.demoComponent;

  if (!process.env.API_KEY) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">
                <h2 className="font-bold text-lg mb-2">Configuration Error</h2>
                <p>The `API_KEY` environment variable is not set.</p>
                <p className="mt-1 text-sm">Please ensure your API key is correctly configured to use this application.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6 flex flex-col fixed h-full">
        <h1 className="text-2xl font-bold text-white mb-8">LLM Chaining</h1>
        <nav className="flex flex-col space-y-2">
          {STRATEGIES.map(strategy => (
            <button
              key={strategy.id}
              onClick={() => setActiveStrategyId(strategy.id)}
              className={`px-4 py-2 text-left rounded-md transition-colors text-base font-medium ${
                activeStrategyId === strategy.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {strategy.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <header>
            <h2 className="text-4xl font-bold text-white tracking-tight">{activeStrategy.name}</h2>
            <p className="mt-3 text-lg text-gray-400">{activeStrategy.description}</p>
          </header>

          {/* Pseudo-Code Section */}
          <section>
            <h3 className="text-2xl font-semibold text-white mb-4">Pseudo-Code Example</h3>
            <CodeBlock code={activeStrategy.pseudoCode} />
          </section>

          {/* Interactive Demo Section */}
          <section>
            <h3 className="text-2xl font-semibold text-white mb-4">Interactive Demo</h3>
            <div className="bg-gray-800/20 border border-gray-700 p-6 rounded-lg">
              <DemoComponent />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
