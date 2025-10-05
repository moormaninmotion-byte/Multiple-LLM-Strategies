import React, { useState, useMemo, useEffect } from 'react';
import { STRATEGIES } from './constants';
import type { StrategyId } from './types';
import CodeBlock from './components/CodeBlock';
import StrategyDiagram from './components/StrategyDiagram';
import MenuIcon from './components/icons/MenuIcon';

const App: React.FC = () => {
  const [activeStrategyId, setActiveStrategyId] = useState<StrategyId>(STRATEGIES[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeStrategy = useMemo(() => {
    return STRATEGIES.find(s => s.id === activeStrategyId)!;
  }, [activeStrategyId]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeStrategyId]);

  const DemoComponent = activeStrategy.demoComponent;

  if (!process.env.API_KEY) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-white p-4">
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">
                <h2 className="font-bold text-lg mb-2">Configuration Error</h2>
                <p>The `API_KEY` environment variable is not set.</p>
                <p className="mt-1 text-sm">Please ensure your API key is correctly configured to use this application.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className={`w-64 bg-gray-900 border-r border-gray-800 p-6 flex-flex-col fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-10">
          
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between pb-4 border-b border-gray-800">
             <h1 className="text-xl font-bold text-white">LLM Chaining</h1>
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-400 hover:text-white" aria-label="Open menu">
                <MenuIcon className="w-6 h-6" />
             </button>
          </div>

          {/* Hero Section */}
          <section className="text-center py-6 border-b border-gray-800 md:mb-10">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">LLM Chaining Explorer</h1>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-400 font-body">
                  A curation of practical information on methods for LLM chaining.
              </p>
          </section>

          {/* Header */}
          <header>
            <h2 className="text-3xl font-bold text-white tracking-tight">{activeStrategy.name}</h2>
            <p className="mt-2 text-base text-gray-400 font-body">{activeStrategy.description}</p>
          </header>

          {/* Use Cases Section */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-3">Production Use Cases</h3>
            <div className="bg-gray-800/20 border border-gray-700 p-5 rounded-lg">
                <ul className="space-y-2 list-disc list-inside text-gray-300 text-sm font-body">
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
                    <p className="text-sm text-gray-400 mb-2 font-body">{tool.description}</p>
                    <div className="bg-gray-900/50 p-3 rounded-md">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Usage Example</p>
                        <p className="text-sm text-gray-300 font-body">{tool.usage}</p>
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
                      <p className="text-sm text-gray-300 font-body">{activeStrategy.implementation.overview}</p>
                  </div>
                  <div>
                      <h4 className="font-semibold text-base text-white mb-1">Key Dependencies</h4>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pl-2 font-body">
                          {activeStrategy.implementation.dependencies.map((dep, i) => <li key={i}>{dep}</li>)}
                      </ul>
                  </div>
                  <div>
                      <h4 className="font-semibold text-base text-white mb-1">Requirements</h4>
                      <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pl-2 font-body">
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

          <footer className="text-center pt-8 pb-4 text-xs text-gray-500 border-t border-gray-800">
             <p>This is a demonstration application. AI-generated content may be inaccurate or incomplete.</p>
             <p className="mt-1">&copy; 2024 LLM Chaining Explorer. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;