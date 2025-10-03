import React, { useState, useCallback } from 'react';
import type { ChainStep, Priority } from '../../types';
import { streamGeminiResponse } from '../../services/geminiService';
import Spinner from '../Spinner';
import CheckIcon from '../icons/CheckIcon';
import Feedback from '../Feedback';

type Topic = 'history' | 'math' | 'science' | 'unknown';

const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

const RouterChainDemo: React.FC = () => {
  const [query, setQuery] = useState<string>('Why is the sky blue?');
  const [steps, setSteps] = useState<ChainStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);

  const runChain = useCallback(async () => {
    setIsLoading(true);
    setRunId(Date.now().toString());
    const initialSteps: ChainStep[] = [
      { title: 'Step 1: Route Query', prompt: `Categorize the following query. Respond with only one word: 'history', 'math', or 'science'. Query: ${query}`, output: '', isLoading: true, isComplete: false, priority: 'high' },
      { title: 'Step 2: Expert Answer', prompt: '', output: '', isLoading: false, isComplete: false, priority: 'medium' },
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

  const isChainComplete = steps.length > 0 && steps[steps.length - 1].isComplete;

  return (
    <div className="space-y-5">
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
            className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
            placeholder="e.g., What is 2+2?"
            disabled={isLoading}
          />
          <button
            onClick={runChain}
            disabled={isLoading || !query}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm"
          >
            {isLoading ? <><Spinner /> Running...</> : 'Run Chain'}
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className={`bg-gray-800/50 border rounded-lg transition-all duration-300 ease-in-out ${step.isComplete ? 'border-green-500/30' : 'border-gray-700'}`}>
            <div className="p-3 flex items-center justify-between border-b border-gray-700/50">
              <h4 className="font-semibold text-base flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${step.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'} ${step.isLoading ? 'animate-pulse' : ''}`}>
                      {step.isLoading ? <Spinner className="w-4 h-4" /> : step.isComplete ? <CheckIcon className="w-5 h-5" /> : <span className="font-mono font-bold">{index + 1}</span>}
                  </div>
                  {step.title}
              </h4>
               {step.priority && (
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${getPriorityStyles(step.priority)}`}>
                    {step.priority}
                </span>
              )}
            </div>
            
            {(step.prompt || step.output) && (
              <div className="p-3 space-y-3">
                {step.prompt && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Prompt</p>
                        <p className="text-xs text-gray-400 font-mono bg-gray-900/50 p-2.5 rounded-md break-all">{step.prompt}</p>
                    </div>
                )}
                
                {(step.isLoading || step.output) && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Output</p>
                        <div className="text-gray-300 whitespace-pre-wrap bg-gray-900/20 p-2.5 rounded-md min-h-[2.5em] text-sm">
                            {step.output}
                            {step.isLoading && !step.output && <span className="text-gray-500 italic">Generating...</span>}
                            {step.isLoading && step.output && <span className="inline-block w-0.5 h-4 bg-gray-300 animate-pulse ml-1 align-[-2px]" />}
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {isChainComplete && runId && (
        <Feedback runId={`router-${runId}`} />
      )}
    </div>
  );
};

export default RouterChainDemo;