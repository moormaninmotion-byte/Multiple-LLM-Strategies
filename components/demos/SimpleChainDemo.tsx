import React, { useState, useCallback } from 'react';
import type { ChainStep, Priority } from '../../types';
import { streamGeminiResponse } from '../../services/geminiService';
import Spinner from '../Spinner';
import CheckIcon from '../icons/CheckIcon';
import Feedback from '../Feedback';

interface DemoProps {
  apiKey: string | null;
}

const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

const SimpleChainDemo: React.FC<DemoProps> = ({ apiKey }) => {
  const [topic, setTopic] = useState<string>('a haunted spaceship');
  const [steps, setSteps] = useState<ChainStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const isApiKeySet = !!apiKey;

  const runChain = useCallback(async () => {
    if (!apiKey) return;

    setIsLoading(true);
    setRunId(Date.now().toString());
    const initialSteps: ChainStep[] = [
      { title: 'Step 1: Generate Title', prompt: `Generate a creative title for a sci-fi story about ${topic}.`, output: '', isLoading: true, isComplete: false, priority: 'high' },
      { title: 'Step 2: Generate Synopsis', prompt: '', output: '', isLoading: false, isComplete: false, priority: 'medium' },
    ];
    setSteps(initialSteps);

    // Step 1
    const titlePrompt = initialSteps[0].prompt;
    let generatedTitle = '';
    for await (const chunk of streamGeminiResponse(apiKey, titlePrompt)) {
      generatedTitle += chunk;
      setSteps(prev => {
        const newSteps = [...prev];
        newSteps[0].output = generatedTitle;
        return newSteps;
      });
    }
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[0].isLoading = false;
      newSteps[0].isComplete = true;
      newSteps[1].prompt = `Write a short story synopsis based on the title: "${generatedTitle}"`;
      newSteps[1].isLoading = true;
      return newSteps;
    });

    // Step 2
    const synopsisPrompt = `Write a short story synopsis based on the title: "${generatedTitle}"`;
    let generatedSynopsis = '';
     for await (const chunk of streamGeminiResponse(apiKey, synopsisPrompt)) {
      generatedSynopsis += chunk;
      setSteps(prev => {
        const newSteps = [...prev];
        newSteps[1].output = generatedSynopsis;
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
  }, [topic, apiKey]);

  const isChainComplete = steps.length > 0 && steps[steps.length - 1].isComplete;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="topic-input" className="block text-sm font-medium text-gray-400">
          Enter a story topic:
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            id="topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
            placeholder="e.g., a haunted spaceship"
            disabled={isLoading}
          />
          <button
            onClick={runChain}
            disabled={isLoading || !topic || !isApiKeySet}
            title={!isApiKeySet ? "Please provide an API key to run this demo" : ""}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm"
          >
            {isLoading ? <><Spinner /> <span role="status">Running...</span></> : 'Run Chain'}
          </button>
        </div>
         {!isApiKeySet && (
          <div className="text-xs text-yellow-400 text-center bg-yellow-900/40 p-2 rounded-md mt-2">
              Please provide an API key to run this demo.
          </div>
        )}
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
        <Feedback runId={`simple-${runId}`} />
      )}
    </div>
  );
};

export default SimpleChainDemo;
