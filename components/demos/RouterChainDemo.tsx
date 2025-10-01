import React, { useState, useCallback } from 'react';
import type { ChainStep } from '../../types';
import { streamGeminiResponse } from '../../services/geminiService';
import Spinner from '../Spinner';
import CheckIcon from '../icons/CheckIcon';

type Topic = 'history' | 'math' | 'science' | 'unknown';

const RouterChainDemo: React.FC = () => {
  const [query, setQuery] = useState<string>('Why is the sky blue?');
  const [steps, setSteps] = useState<ChainStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runChain = useCallback(async () => {
    setIsLoading(true);
    const initialSteps: ChainStep[] = [
      { title: 'Step 1: Route Query', prompt: `Categorize the following query. Respond with only one word: 'history', 'math', or 'science'. Query: ${query}`, output: '', isLoading: true, isComplete: false },
      { title: 'Step 2: Expert Answer', prompt: '', output: '', isLoading: false, isComplete: false },
    ];
    setSteps(initialSteps);

    // Step 1: Router
    let topicResponse = '';
    for await (const chunk of streamGeminiResponse(initialSteps[0].prompt)) {
      topicResponse += chunk;
      setSteps(prev => {
          const newSteps = [...prev];
          newSteps[0].output = topicResponse;
          return newSteps;
      });
    }
    
    const topic: Topic = topicResponse.trim().toLowerCase().includes('history') ? 'history' 
        : topicResponse.trim().toLowerCase().includes('math') ? 'math'
        : topicResponse.trim().toLowerCase().includes('science') ? 'science'
        : 'unknown';

    setSteps(prev => {
        const newSteps = [...prev];
        newSteps[0].isLoading = false;
        newSteps[0].isComplete = true;
        newSteps[0].output = `Routing to: ${topic.toUpperCase()} expert`;
        newSteps[1].isLoading = true;
        return newSteps;
    });

    // Step 2: Expert
    let expertPrompt = '';
    let systemInstruction = '';
    if (topic === 'unknown') {
        expertPrompt = "Acknowledge that you can't determine if the user's query is about history, math, or science, and ask them to rephrase.";
    } else {
        expertPrompt = `Answer the following query: ${query}`;
        systemInstruction = `You are a world-class expert in ${topic}. Provide a clear, concise, and accurate answer.`;
    }
    
    setSteps(prev => {
        const newSteps = [...prev];
        newSteps[1].prompt = expertPrompt;
        newSteps[1].title = `Step 2: ${topic.charAt(0).toUpperCase() + topic.slice(1)} Expert Answer`;
        return newSteps;
    });


    let expertAnswer = '';
    for await (const chunk of streamGeminiResponse(expertPrompt, systemInstruction)) {
      expertAnswer += chunk;
      setSteps(prev => {
        const newSteps = [...prev];
        newSteps[1].output = expertAnswer;
        return newSteps;
      });
    }
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[1].isLoading = false;
      newSteps[1].isComplete = true;
      return newSteps;
    });

    setIsLoading(false);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="query-input" className="block text-sm font-medium text-gray-400">
          Enter a query (try history, math, or science):
        </label>
        <div className="flex gap-4">
          <input
            id="query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="e.g., What is 2+2?"
            disabled={isLoading}
          />
          <button
            onClick={runChain}
            disabled={isLoading || !query}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isLoading ? <><Spinner /> Running...</> : 'Run Chain'}
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className={`bg-gray-800/50 border rounded-lg transition-all duration-300 ease-in-out ${step.isComplete ? 'border-green-500/30' : 'border-gray-700'}`}>
            <div className="p-4 flex items-center justify-between border-b border-gray-700/50">
              <h4 className="font-semibold text-lg flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${step.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'} ${step.isLoading ? 'animate-pulse' : ''}`}>
                      {step.isLoading ? <Spinner className="w-4 h-4" /> : step.isComplete ? <CheckIcon className="w-5 h-5" /> : <span className="font-mono font-bold">{index + 1}</span>}
                  </div>
                  {step.title}
              </h4>
            </div>
            
            <div className={`p-4 space-y-4 transition-opacity duration-500 ${step.prompt || step.output ? 'opacity-100' : 'opacity-0'}`}>
              {step.prompt && (
                  <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Prompt</p>
                      <p className="text-sm text-gray-400 font-mono bg-gray-900/50 p-3 rounded-md break-all">{step.prompt}</p>
                  </div>
              )}
              
              {(step.isLoading || step.isComplete) && step.output !== '' && (
                  <div>
                      <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Output</p>
                      <div className="text-gray-300 whitespace-pre-wrap bg-gray-900/20 p-3 rounded-md min-h-[2.5em]">
                          {step.output}
                          {step.isLoading && <span className="inline-block w-0.5 h-4 bg-gray-300 animate-pulse ml-1 align-[-2px]" />}
                      </div>
                  </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouterChainDemo;
