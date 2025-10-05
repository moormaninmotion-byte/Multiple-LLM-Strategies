import React, { useState, useCallback } from 'react';
import { streamGeminiResponse } from '../../services/geminiService';
import Spinner from '../Spinner';
import CheckIcon from '../icons/CheckIcon';
import Feedback from '../Feedback';

interface DemoProps {
  apiKey: string | null;
}

const NUM_THOUGHTS = 3;

interface Thought {
  id: number;
  text: string;
  status: 'pending' | 'generating' | 'evaluating' | 'evaluated' | 'selected' | 'discarded';
  evaluation?: {
    score: number;
    justification: string;
  };
}

interface FinalAnswer {
    text: string;
    isLoading: boolean;
    isComplete: boolean;
}

const TreeOfThoughtsDemo: React.FC<DemoProps> = ({ apiKey }) => {
    const [problem, setProblem] = useState('Write a short, optimistic sci-fi story about first contact with an alien species.');
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [finalAnswer, setFinalAnswer] = useState<FinalAnswer | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeStep, setActiveStep] = useState<'generate' | 'evaluate' | 'synthesize' | null>(null);
    const [runId, setRunId] = useState<string | null>(null);
    const isApiKeySet = !!apiKey;

    const parseEvaluation = (text: string): { score: number; justification: string } => {
        try {
            const jsonString = text.match(/```json\n([\s\S]*?)\n```/)?.[1] || text;
            const parsed = JSON.parse(jsonString);
            return {
                score: Number(parsed.score) || 0,
                justification: parsed.justification || "Could not parse justification."
            };
        } catch (e) {
            return { score: 0, justification: "Failed to parse JSON evaluation." };
        }
    }
    
    const runChain = useCallback(async () => {
        if (!apiKey) return;

        setIsLoading(true);
        setRunId(Date.now().toString());
        setFinalAnswer(null);

        // --- Step 1: Generation ---
        setActiveStep('generate');
        const initialThoughts: Thought[] = Array.from({ length: NUM_THOUGHTS }, (_, i) => ({
            id: i, text: '', status: 'generating'
        }));
        setThoughts(initialThoughts);

        const currentThoughts: Thought[] = await new Promise(resolve => {
            setThoughts(prev => {
                resolve(prev);
                return prev;
            })
        });

        const generationPromises = currentThoughts.map(thought => {
            const prompt = `You are a creative writer. Generate one unique and creative opening paragraph for a story based on this premise: "${problem}".`;
            let fullText = '';
            return (async () => {
                for await (const chunk of streamGeminiResponse(apiKey, prompt)) {
                    fullText += chunk;
                    setThoughts(prev => prev.map(t => t.id === thought.id ? { ...t, text: fullText } : t));
                }
            })();
        });
        await Promise.all(generationPromises);
        
        const thoughtsAfterGen: Thought[] = await new Promise(resolve => {
            setThoughts(prev => {
                resolve(prev);
                return prev.map(t => ({...t, status: 'evaluating'}));
            })
        });


        // --- Step 2: Evaluation ---
        setActiveStep('evaluate');
        const evaluationPromises = thoughtsAfterGen.map(thought => {
            const prompt = `Evaluate the following story opening on a scale of 1-10 for its creativity, potential, and engagement. Respond ONLY with a single JSON object with two keys: "score" (number) and "justification" (string).\n\nOpening: "${thought.text}"`;
            let fullText = '';
            return (async () => {
                 for await (const chunk of streamGeminiResponse(apiKey, prompt)) {
                    fullText += chunk;
                 }
                 const evaluation = parseEvaluation(fullText);
                 setThoughts(prev => prev.map(t => t.id === thought.id ? { ...t, status: 'evaluated', evaluation } : t));
            })();
        });
        await Promise.all(evaluationPromises);

        // --- Step 3: Selection ---
        let bestThought: Thought | undefined;
        setThoughts(prev => {
            const evaluatedThoughts = [...prev];
            bestThought = evaluatedThoughts.sort((a, b) => (b.evaluation?.score ?? 0) - (a.evaluation?.score ?? 0))[0];
            return evaluatedThoughts.map(t => ({
                ...t,
                status: t.id === bestThought?.id ? 'selected' : 'discarded'
            }));
        });
        
        if (!bestThought) {
            setIsLoading(false);
            return;
        }

        // --- Step 4: Synthesis ---
        setActiveStep('synthesize');
        setFinalAnswer({ text: '', isLoading: true, isComplete: false });
        const synthesisPrompt = `Continue and conclude the story based on the following selected opening paragraph:\n\n"${bestThought.text}"`;
        let fullAnswer = '';
        for await (const chunk of streamGeminiResponse(apiKey, synthesisPrompt)) {
            fullAnswer += chunk;
            setFinalAnswer(prev => prev ? { ...prev, text: fullAnswer } : null);
        }

        setFinalAnswer(prev => prev ? { ...prev, isLoading: false, isComplete: true } : null);
        setIsLoading(false);
        setActiveStep(null);
    }, [problem, apiKey]);

    const isChainComplete = finalAnswer?.isComplete;

    const getStepBorderColor = (step: 'generate' | 'evaluate' | 'synthesize') => {
        if (activeStep === step) return 'border-blue-500/50';
        if (activeStep === null || (activeStep === 'evaluate' && step === 'generate') || (activeStep === 'synthesize' && (step === 'generate' || step === 'evaluate'))) return 'border-green-500/30';
        return 'border-gray-700';
    }

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="problem-input" className="block text-sm font-medium text-gray-400">
                    Enter a problem or creative prompt:
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        id="problem-input"
                        type="text"
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                        placeholder="Enter a complex problem..."
                        disabled={isLoading}
                    />
                    <button
                        onClick={runChain}
                        disabled={isLoading || !problem || !isApiKeySet}
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
                {thoughts.length > 0 && (
                    <div className={`bg-gray-800/50 border rounded-lg transition-all duration-300 ${getStepBorderColor('generate')}`}>
                        <div className="p-3 flex items-center justify-between border-b border-gray-700/50">
                            <h4 className="font-semibold text-base flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${activeStep === 'generate' ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
                                    {activeStep === 'generate' || isLoading ? <Spinner className="w-4 h-4" /> : <CheckIcon className="w-5 h-5" />}
                                </div>
                                Step 1: Generate & Evaluate Thoughts
                            </h4>
                        </div>
                         <div className={`p-3 grid grid-cols-1 lg:grid-cols-3 gap-3`}>
                            {thoughts.map(thought => (
                                <div key={thought.id} className={`bg-gray-900/40 rounded-lg p-3 space-y-2 border-2 transition-all duration-500 ${thought.status === 'selected' ? 'border-green-500' : thought.status === 'discarded' ? 'border-transparent opacity-50' : 'border-transparent'}`}>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Thought {thought.id + 1}</p>
                                    <div className="text-gray-300 text-sm whitespace-pre-wrap min-h-[6em]">
                                        {thought.text}
                                        {thought.status === 'generating' && <span className="inline-block w-0.5 h-4 bg-gray-300 animate-pulse ml-1 align-[-2px]" />}
                                    </div>
                                    {thought.evaluation && (
                                        <div className={`bg-gray-800/50 rounded p-2 transition-all duration-300`}>
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Evaluation</p>
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="font-bold text-lg text-white">{thought.evaluation.score}/10</p>
                                                <p className="text-xs text-gray-400 italic text-right">"{thought.evaluation.justification}"</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {finalAnswer && (
                    <div className={`bg-gray-800/50 border rounded-lg transition-all duration-300 ${getStepBorderColor('synthesize')}`}>
                        <div className="p-3 flex items-center justify-between border-b border-gray-700/50">
                            <h4 className="font-semibold text-base flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${finalAnswer.isLoading ? 'bg-blue-500/20 text-blue-400 animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
                                    {finalAnswer.isLoading ? <Spinner className="w-4 h-4" /> : <CheckIcon className="w-5 h-5" />}
                                </div>
                                Step 2: Synthesize Final Answer
                            </h4>
                        </div>
                        <div className="p-3 space-y-3">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Final Output</p>
                                <div className="text-gray-300 whitespace-pre-wrap bg-gray-900/20 p-2.5 rounded-md min-h-[2.5em] text-sm">
                                    {finalAnswer.text}
                                    {finalAnswer.isLoading && <span className="inline-block w-0.5 h-4 bg-gray-300 animate-pulse ml-1 align-[-2px]" />}
                                </div>
                            </div>
                        </div>
                     </div>
                )}
            </div>
            
            {isChainComplete && runId && (
              <Feedback runId={`tree-of-thoughts-${runId}`} />
            )}
        </div>
    );
};

export default TreeOfThoughtsDemo;
