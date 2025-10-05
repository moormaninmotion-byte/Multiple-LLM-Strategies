import React, { useState, useCallback } from 'react';
import type { ChainStep } from '../../types';
import { streamGeminiResponse } from '../../services/geminiService';
import Spinner from '../Spinner';
import CheckIcon from '../icons/CheckIcon';
import Feedback from '../Feedback';
import TrashIcon from '../icons/TrashIcon';

interface CustomStep {
  id: number;
  title: string;
  promptTemplate: string;
}

const CustomChainDemo: React.FC = () => {
  const [customSteps, setCustomSteps] = useState<CustomStep[]>([
    { id: 1, title: 'Generate a creative story title', promptTemplate: 'Generate a creative title for a sci-fi story about a lost robot.' },
    { id: 2, title: 'Write a synopsis', promptTemplate: 'Write a short story synopsis based on the title: "{{output_1}}"' },
    { id: 3, title: 'Name the main character', promptTemplate: 'Based on this synopsis, suggest a fitting name for the main robot character:\n\n{{output_2}}' },
  ]);
  const [executionSteps, setExecutionSteps] = useState<ChainStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);

  const addStep = () => {
    const newStep: CustomStep = {
      id: Date.now(),
      title: `Step ${customSteps.length + 1}`,
      promptTemplate: '',
    };
    setCustomSteps([...customSteps, newStep]);
  };

  const updateStep = (id: number, field: keyof Omit<CustomStep, 'id'>, value: string) => {
    setCustomSteps(prev =>
      prev.map(step => (step.id === id ? { ...step, [field]: value } : step))
    );
  };

  const removeStep = (id: number) => {
    setCustomSteps(prev => prev.filter(step => step.id !== id));
  };
  
  const runChain = useCallback(async () => {
    setIsLoading(true);
    setRunId(Date.now().toString());
    
    const outputs: string[] = [];
    const initialExecutionSteps: ChainStep[] = customSteps.map((step, i) => ({
      title: step.title || `Step ${i + 1}`,
      prompt: '', // Will be resolved at runtime
      output: '',
      isLoading: false,
      isComplete: false,
    }));
    setExecutionSteps(initialExecutionSteps);

    for (let i = 0; i < customSteps.length; i++) {
      // Set current step to loading
      setExecutionSteps(prev => {
        const newSteps = [...prev];
        newSteps[i].isLoading = true;
        return newSteps;
      });

      // Resolve prompt
      const resolvedPrompt = customSteps[i].promptTemplate.replace(/\{\{output_(\d+)\}\}/g, (_, p1) => {
        const index = parseInt(p1, 10) - 1;
        return outputs[index] || `[Error: Output of step ${p1} not found]`;
      });

      // Update prompt in UI
      setExecutionSteps(prev => {
        const newSteps = [...prev];
        newSteps[i].prompt = resolvedPrompt;
        return newSteps;
      });

      // Stream response
      let currentOutput = '';
      for await (const chunk of streamGeminiResponse(resolvedPrompt)) {
        currentOutput += chunk;
        setExecutionSteps(prev => {
          const newSteps = [...prev];
          newSteps[i].output = currentOutput;
          return newSteps;
        });
      }

      // Store output and complete step
      outputs.push(currentOutput);
      setExecutionSteps(prev => {
        const newSteps = [...prev];
        newSteps[i].isLoading = false;
        newSteps[i].isComplete = true;
        return newSteps;
      });
    }
    setIsLoading(false);
  }, [customSteps]);

  const isChainComplete = executionSteps.length > 0 && executionSteps[executionSteps.length - 1].isComplete;

  return (
    <div className="space-y-6">
      {/* Step Definition UI */}
      <div>
        <h4 className="text-lg font-semibold text-white mb-3">Define Your Chain</h4>
         <div className="bg-sky-900/40 border border-sky-700 p-3 rounded-md mb-4 text-sm text-sky-200">
            Use <code className="bg-sky-900/50 px-1 py-0.5 rounded font-mono text-xs">{`{{output_N}}`}</code> to reference the output from a previous step (e.g., <code className="bg-sky-900/50 px-1 py-0.5 rounded font-mono text-xs">{`{{output_1}}`}</code> for Step 1's result).
        </div>
        <div className="space-y-3">
          {customSteps.map((step, index) => (
            <div key={step.id} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h5 className="font-semibold text-gray-200">Step {index + 1}</h5>
                <button 
                  onClick={() => removeStep(step.id)}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/50 rounded-full transition-colors disabled:opacity-50"
                  aria-label={`Remove Step ${index + 1}`}
                  disabled={isLoading}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                value={step.title}
                onChange={e => updateStep(step.id, 'title', e.target.value)}
                placeholder="Enter step title..."
                className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                disabled={isLoading}
              />
              <textarea
                value={step.promptTemplate}
                onChange={e => updateStep(step.id, 'promptTemplate', e.target.value)}
                rows={3}
                placeholder="Enter prompt template..."
                className="w-full bg-gray-900/70 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm font-mono"
                disabled={isLoading}
              />
            </div>
          ))}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={addStep}
              disabled={isLoading}
              className="px-4 py-2 w-full sm:w-auto bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 transition-colors text-sm"
            >
              + Add Step
            </button>
            <button
              onClick={runChain}
              disabled={isLoading || customSteps.length === 0}
              className="px-6 py-2 w-full sm:w-auto bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm"
            >
              {isLoading ? <><Spinner /> <span role="status">Running...</span></> : 'Run Chain'}
            </button>
          </div>
        </div>
      </div>

      {/* Execution Results UI */}
      {executionSteps.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-gray-700/50">
           <h4 className="text-lg font-semibold text-white">Execution Results</h4>
          {executionSteps.map((step, index) => (
            <div key={index} className={`bg-gray-800/50 border rounded-lg transition-all duration-300 ease-in-out ${step.isComplete ? 'border-green-500/30' : 'border-gray-700'}`}>
              <div className="p-3 flex items-center justify-between border-b border-gray-700/50">
                <h4 className="font-semibold text-base flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${step.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'} ${step.isLoading ? 'animate-pulse' : ''}`}>
                        {step.isLoading ? <Spinner className="w-4 h-4" /> : step.isComplete ? <CheckIcon className="w-5 h-5" /> : <span className="font-mono font-bold">{index + 1}</span>}
                    </div>
                    {step.title}
                </h4>
              </div>
              
              <div className="p-3 space-y-3">
                {step.prompt && (
                    <div>
                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Resolved Prompt</p>
                        <p className="text-xs text-gray-400 font-mono bg-gray-900/50 p-2.5 rounded-md break-all">{step.prompt}</p>
                    </div>
                )}
                
                <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Output</p>
                    <div className="text-gray-300 whitespace-pre-wrap bg-gray-900/20 p-2.5 rounded-md min-h-[2.5em] text-sm">
                        {step.output}
                        {step.isLoading && !step.output && <span className="text-gray-500 italic">Generating...</span>}
                        {step.isLoading && step.output && <span className="inline-block w-0.5 h-4 bg-gray-300 animate-pulse ml-1 align-[-2px]" />}
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isChainComplete && runId && (
        <Feedback runId={`custom-${runId}`} />
      )}
    </div>
  );
};

export default CustomChainDemo;