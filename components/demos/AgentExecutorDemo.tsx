import React, { useState, useCallback } from 'react';
import type { ChainStep } from '../../types';
import { streamGeminiResponse } from '../../services/geminiService';
import Spinner from '../Spinner';
import CheckIcon from '../icons/CheckIcon';
import Feedback from '../Feedback';

interface DemoProps {
  apiKey: string | null;
}

// Custom icons for agent steps
const ThoughtIcon: React.FC = () => (
  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20.9 13.9A8.9 8.9 0 0 1 12 22a9 9 0 0 1-9-9 9 9 0 0 1 9-9 8.9 8.9 0 0 1 8.9 4.9Z"/><path d="M12 2a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3c.4 0 .9-.1 1.3-.2L16 11l-1.4 1.4" /><path d="M12 18a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3c-.4 0-.9.1-1.3.2L8 9l1.4 1.4" /></svg>
);

const ActionIcon: React.FC = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);

const ObservationIcon: React.FC = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

const AnswerIcon: React.FC = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
);


interface AgentStep {
  type: 'thought' | 'action' | 'observation' | 'final-answer';
  title: string;
  content: string;
  isLoading: boolean;
  isComplete: boolean;
}

// This is a minimal, safe expression evaluator for demo purposes.
// It only handles +, -, *, /, **, and parentheses with single numbers.
const safeEvaluate = (expression: string): string => {
    // 1. Validate allowed characters.
    if (!/^[0-9+\-*/^().\s]+$/.test(expression)) {
        return "Invalid characters in expression";
    }

    // 2. Prevent multiple operators next to each other (e.g., `5**+3`)
    if (/[\+\-\*\/\^]{2,}/.test(expression)) {
        return "Invalid expression format";
    }
    
    // 3. Prevent unbalanced parentheses
    if ( (expression.match(/\(/g) || []).length !== (expression.match(/\)/g) || []).length ) {
        return "Mismatched parentheses";
    }

    // Replace ^ with ** for JavaScript
    const safeExpression = expression.replace(/\^/g, '**');

    try {
        // NOTE: For a real production app, a dedicated math parsing library (e.g., math.js) is the correct approach.
        // This sandboxed function prevents access to global scope (e.g., `window`).
        const result = new Function(`"use strict"; return ${safeExpression}`)();
        if (typeof result === 'number' && !isNaN(result)) {
            return result.toString();
        }
        return "Invalid calculation result";
    } catch (e) {
        return "Invalid mathematical expression";
    }
};

const AgentExecutorDemo: React.FC<DemoProps> = ({ apiKey }) => {
    const [query, setQuery] = useState("What is (5 * 12) + 2^3, and what is the weather like in London?");
    const [steps, setSteps] = useState<AgentStep[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [runId, setRunId] = useState<string | null>(null);
    const isApiKeySet = !!apiKey;

    // --- Mock Tools ---
    const mockCalculator = async (expression: string): Promise<string> => {
        await new Promise(res => setTimeout(res, 500));
        return safeEvaluate(expression);
    };

    const mockSearch = async (searchTerm: string): Promise<string> => {
        await new Promise(res => setTimeout(res, 800));
        const term = searchTerm.toLowerCase();
        if (term.includes("weather") && term.includes("london")) {
            return "Sunny with a high of 18°C.";
        }
        if (term.includes("capital") && term.includes("japan")) {
            return "The capital of Japan is Tokyo.";
        }
        return "I couldn't find information on that topic.";
    };

    const getStepIcon = (type: AgentStep['type']) => {
        switch (type) {
            case 'thought': return <ThoughtIcon />;
            case 'action': return <ActionIcon />;
            case 'observation': return <ObservationIcon />;
            case 'final-answer': return <AnswerIcon />;
            default: return null;
        }
    };

    const runChain = useCallback(async () => {
        if (!apiKey) return;
        
        setIsLoading(true);
        setRunId(Date.now().toString());
        const currentSteps: AgentStep[] = [];
        setSteps(currentSteps);

        const addStep = async (step: Omit<AgentStep, 'isComplete' | 'isLoading'>, delay = 250) => {
            await new Promise(res => setTimeout(res, delay));
            const newStep = { ...step, isLoading: false, isComplete: false };
            setSteps(prev => [...prev, newStep]);
            return currentSteps.push(newStep) - 1;
        };
        
        const completeStep = (index: number) => {
             setSteps(prev => {
                const newSteps = [...prev];
                if(newSteps[index]) {
                    newSteps[index].isLoading = false;
                    newSteps[index].isComplete = true;
                }
                return newSteps;
            });
        }
        
        // --- Agent Logic ---
        const mathRegex = /(\(?(?:\d+\s*[*+/-]\s*)+\d+\)?|\d+\s*\^\s*\d+)/;
        const mathExpression = query.match(mathRegex)?.[0];
        const needsSearch = /weather|capital|population/i.test(query);
        
        let toolObservations = [];

        if (mathExpression) {
            const thoughtIdx = await addStep({ type: 'thought', title: 'Thought', content: 'The user query contains a mathematical expression. I should use the Calculator tool to solve it.' });
            completeStep(thoughtIdx);

            const actionIdx = await addStep({ type: 'action', title: `Action: Calculator`, content: mathExpression });
            const calculationResult = await mockCalculator(mathExpression);
            completeStep(actionIdx);

            const obsIdx = await addStep({ type: 'observation', title: 'Observation', content: calculationResult });
            completeStep(obsIdx);
            toolObservations.push(`- Calculator Result: ${calculationResult}`);
        }

        if (needsSearch) {
             const thoughtIdx = await addStep({ type: 'thought', title: 'Thought', content: 'The user query asks for real-world information. I should use the Search tool.' });
            completeStep(thoughtIdx);

            const actionIdx = await addStep({ type: 'action', title: `Action: Search`, content: query });
            const searchResult = await mockSearch(query);
            completeStep(actionIdx);

            const obsIdx = await addStep({ type: 'observation', title: 'Observation', content: searchResult });
            completeStep(obsIdx);
            toolObservations.push(`- Search Result: "${searchResult}"`);
        }
        
        // --- Final Answer Generation ---
        const thoughtIdx = await addStep({ type: 'thought', title: 'Thought', content: 'I have gathered all necessary information from the tools. Now I will formulate the final answer for the user.' });
        completeStep(thoughtIdx);
        
        const finalAnswerIdx = await addStep({ type: 'final-answer', title: 'Final Answer', content: '' });
        
        setSteps(prev => {
            const newSteps = [...prev];
            newSteps[finalAnswerIdx].isLoading = true;
            return newSteps;
        });

        const finalPrompt = `You are a helpful assistant. The user asked: "${query}". You have used tools to gather the following information:\n${toolObservations.join('\n')}\n\nBased on this, provide a comprehensive final answer to the user.`;
        
        let fullAnswer = '';
        for await (const chunk of streamGeminiResponse(apiKey, finalPrompt)) {
            fullAnswer += chunk;
            setSteps(prev => {
                const newSteps = [...prev];
                if (newSteps[finalAnswerIdx]) {
                    newSteps[finalAnswerIdx].content = fullAnswer;
                }
                return newSteps;
            });
        }
        
        completeStep(finalAnswerIdx);
        setIsLoading(false);
    }, [query, apiKey]);

    const isChainComplete = steps.length > 0 && steps[steps.length - 1].isComplete && steps[steps.length - 1].type === 'final-answer';

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="query-input" className="block text-sm font-medium text-gray-400">
          Enter a complex query:
        </label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            id="query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
            placeholder="Try math, weather, etc."
            disabled={isLoading}
          />
          <button
            onClick={runChain}
            disabled={isLoading || !query || !isApiKeySet}
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
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${step.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'} ${step.isLoading ? 'animate-pulse' : ''}`}>
                      {step.isLoading ? <Spinner className="w-4 h-4" /> : step.isComplete ? getStepIcon(step.type) : getStepIcon(step.type)}
                  </div>
                  {step.title}
              </h4>
            </div>
            
            <div className="p-3">
                <div className="text-gray-300 whitespace-pre-wrap bg-gray-900/20 p-2.5 rounded-md min-h-[2.5em] text-sm break-words">
                    {step.content}
                    {step.isLoading && <span className="inline-block w-0.5 h-4 bg-gray-300 animate-pulse ml-1 align-[-2px]" />}
                </div>
            </div>
          </div>
        ))}
      </div>

      {isChainComplete && runId && (
        <Feedback runId={`agent-executor-${runId}`} />
      )}
    </div>
  );
};

export default AgentExecutorDemo;
