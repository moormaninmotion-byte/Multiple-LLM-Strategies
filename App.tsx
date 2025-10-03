import React, { useState, useMemo } from 'react';
import { STRATEGIES } from './constants';
import type { StrategyId } from './types';
import CodeBlock from './components/CodeBlock';
import StrategyDiagram from './components/StrategyDiagram';

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
        <h1 className="text-xl font-bold text-white mb-8">LLM Chaining</h1>
        <nav className="flex flex-col space-y-1">
          {STRATEGIES.map(strategy => (
            <button
              key={strategy.id}
              onClick={() => setActiveStrategyId(strategy.id)}
              className={`px-4 py-2 text-left rounded-md transition-colors text-sm font-medium ${
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
      <main className="flex-1 ml-64 p-6">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Hero Section */}
          <section className="text-center py-6 border-b border-gray-800 mb-10">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">LLM Chaining Explorer</h1>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-400">
                  A curation of practical information on methods for LLM chaining.
              </p>
          </section>

          {/* Header */}
          <header>
            <h2 className="text-3xl font-bold text-white tracking-tight">{activeStrategy.name}</h2>
            <p className="mt-2 text-base text-gray-400">{activeStrategy.description}</p>
          </header>

          {/* Use Cases Section */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Production Use Cases</h3>
            <div className="bg-gray-800/20 border border-gray-700 p-5 rounded-lg">
                <ul className="space-y-2 list-disc list-inside text-gray-300 text-sm">
                    {activeStrategy.useCases.map((useCase, index) => (
                        <li key={index}>{useCase}</li>
                    ))}
                </ul>
            </div>
          </section>

          {/* Tools Used Section */}
          {activeStrategy.tools && (
            <section>
              <h3 className="text-xl font-semibold text-white mb-3">Tools Used</h3>
              <div className="space-y-4">
                {activeStrategy.tools.map((tool, index) => (
                  <div key={index} className="bg-gray-800/20 border border-gray-700 p-5 rounded-lg">
                    <h4 className="font-semibold text-base text-white mb-1">{tool.name}</h4>
                    <p className="text-sm text-gray-400 mb-2">{tool.description}</p>
                    <div className="bg-gray-900/50 p-3 rounded-md">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Usage Example</p>
                        <p className="text-sm text-gray-300">{tool.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Implementation Details Section */}
          {activeStrategy.implementation && (
            <section>
              <h3 className="text-xl font-semibold text-white mb-3">Practical Implementation</h3>
              <div className="bg-gray-800/20 border border-gray-700 p-5 rounded-lg space-y-4">
                  <div>
                      <h4 className="font-semibold text-base text-white mb-1">Overview</h4>
                      <p className="text-sm text-gray-300">{activeStrategy.implementation.overview}</p>
                  </div>
                  <div>
                      <h4 className="font-semibold text-base text-white mb-1">Key Dependencies</h4>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pl-2">
                          {activeStrategy.implementation.dependencies.map((dep, i) => <li key={i}>{dep}</li>)}
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-semibold text-base text-white mb-1">Requirements</h4>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pl-2">
                          {activeStrategy.implementation.requirements.map((req, i) => <li key={i}>{req}</li>)}
                      </ul>
                  </div>
              </div>
            </section>
          )}

          {/* Visual Flow Section */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Visual Flow</h3>
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-5 flex items-center justify-center">
              <StrategyDiagram strategyId={activeStrategy.id} />
            </div>
          </section>

          {/* Pseudo-Code Section */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Pseudo-Code Example</h3>
            <CodeBlock code={activeStrategy.pseudoCode} />
          </section>

          {/* Interactive Demo Section */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Interactive Demo</h3>
            <div className="bg-gray-800/20 border border-gray-700 p-5 rounded-lg">
              <DemoComponent />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;