import React, { useState, useCallback } from 'react';
import type { ChainStep, Priority } from '../../types';
import { streamGeminiResponse } from '../../services/geminiService';
import Spinner from '../Spinner';
import CheckIcon from '../icons/CheckIcon';
import Feedback from '../Feedback';

const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
};

const SequentialChainDemo: React.FC = () => {
  const [product, setProduct] = useState<string>('Quantum Quark Cola');
  const [steps, setSteps] = useState<ChainStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);

  const runChain = useCallback(async () => {
    setIsLoading(true);
    setRunId(Date.now().toString());
    const initialSteps: ChainStep[] = [
      { title: 'Step 1: Generate Slogan', prompt: `Create a catchy marketing slogan for ${product}.`, output: '', isLoading: true, isComplete: false, priority: 'high' },
      { title: 'Step 2: Generate Ad Copy', prompt: '', output: '', isLoading: false, isComplete: false, priority: 'medium' },
      { title: 'Step 3: Translate to French', prompt: '', output: '', isLoading: false, isComplete: false, priority: 'low' },
    ];
    setSteps(initialSteps);

    // Step 1: Slogan
    let slogan = '';
    for await (const chunk of streamGeminiResponse(initialSteps[0].prompt)) {
      slogan += chunk;
      setSteps(prev => {
        const newSteps = [...prev];
        newSteps[0].output = slogan;
        return newSteps;
      });
    }
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[0].isLoading = false; newSteps[0].isComplete = true;
      newSteps[1].prompt = `Write a short, punchy ad copy for ${product} using the slogan: "${slogan}"`;
      newSteps[1].isLoading = true;
      return newSteps;
    });

    // Step 2: Ad Copy
    let adCopy = '';
    const adCopyPrompt = `Write a short, punchy ad copy for ${product} using the slogan: "${slogan}"`;
    for await (const chunk of streamGeminiResponse(adCopyPrompt)) {
      adCopy += chunk;
      setSteps(prev => {
        const newSteps = [...prev];
        newSteps[1].output = adCopy;
        return newSteps;
      });
    }
    setSteps(prev => {
        const newSteps = [...prev];
        newSteps[1].isLoading = false; newSteps[1].isComplete = true;
        newSteps[2].prompt = `Translate the following ad copy to French: "${adCopy}"`;
        newSteps[2].isLoading = true;
        return newSteps;
    });

    // Step 3: Translation
    let translation = '';
    const translationPrompt = `Translate the following ad copy to French: "${adCopy}"`;
    for await (const chunk of streamGeminiResponse(translationPrompt)) {
      translation += chunk;
      setSteps(prev => {
        const newSteps = [...prev];
        newSteps[2].output = translation;
        return newSteps;
      });
    }
    setSteps(prev => {
      const newSteps = [...prev];
      newSteps[2].isLoading = false; newSteps[2].isComplete = true;
      return newSteps;
    });

    setIsLoading(false);
  }, [product]);

  const isChainComplete = steps.length > 0 && steps[steps.length - 1].isComplete;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="product-input" className="block text-sm font-medium text-gray-400">
          Enter a fictional product name:
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            id="product-input"
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
            placeholder="e.g., Quantum Quark Cola"
            disabled={isLoading}
          />
          <button
            onClick={runChain}
            disabled={isLoading || !product}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm"
          >
            {isLoading ? <><Spinner /> <span role="status">Running...</span></> : 'Run Chain'}
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
        <Feedback runId={`sequential-${runId}`} />
      )}
    </div>
  );
};

export default SequentialChainDemo;