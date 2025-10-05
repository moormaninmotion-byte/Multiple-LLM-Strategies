import React, { useState, useCallback } from 'react';
import { streamGeminiResponse } from '../../services/geminiService';
import Spinner from '../Spinner';
import CheckIcon from '../icons/CheckIcon';
import Feedback from '../Feedback';

// Re-using icons from AgentExecutorDemo
const ActionIcon: React.FC = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);
const ObservationIcon: React.FC = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const AnswerIcon: React.FC = () => (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
);


interface PlanStep {
    title: string;
    prompt: string;
    plan: string;
    isLoading: boolean;
    isComplete: boolean;
}

interface ExecutionStep {
    type: 'action' | 'observation';
    title: string;
    content: string;
    isComplete: boolean;
}

interface FinalAnswerStep {
    title: string;
    prompt: string;
    answer: string;
    isLoading: boolean;
    isComplete: boolean;
}

const PlannerExecutorDemo: React.FC = () => {
    const [goal, setGoal] = useState('Who is the CEO of Microsoft, what was the company\'s revenue in 2023, and what is their most famous product?');
    const [planStep, setPlanStep] = useState<PlanStep | null>(null);
    const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
    const [finalAnswerStep, setFinalAnswerStep] = useState<FinalAnswerStep | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [runId, setRunId] = useState<string | null>(null);

    // Mock Search Tool
    const mockSearch = async (searchTerm: string): Promise<string> => {
        await new Promise(res => setTimeout(res, 800));
        const term = searchTerm.toLowerCase();
        if (term.includes("ceo of microsoft")) return "Satya Nadella is the CEO of Microsoft.";
        if (term.includes("microsoft revenue 2023")) return "Microsoft's revenue for the fiscal year 2023 was $211.9 billion.";
        if (term.includes("microsoft most famous product")) return "Microsoft's most famous product is the Windows operating system.";
        return `No information found for "${searchTerm}"`;
    };

    const runChain = useCallback(async () => {
        setIsLoading(true);
        setRunId(Date.now().toString());
        setExecutionSteps([]);
        setFinalAnswerStep(null);
        
        // --- 1. Planner Step ---
        const planPrompt = `You are a world-class planner AI. Your job is to create a simple, step-by-step plan to achieve a user's goal. Respond ONLY with the numbered list of steps. Do not add any preamble.\n\nGoal: "${goal}"\n\nPlan:`;
        const initialPlanStep: PlanStep = { title: 'Step 1: Create a Plan', prompt: planPrompt, plan: '', isLoading: true, isComplete: false };
        setPlanStep(initialPlanStep);
        
        let plan = '';
        for await (const chunk of streamGeminiResponse(planPrompt)) {
            plan += chunk;
            setPlanStep(prev => prev ? { ...prev, plan } : null);
        }
        setPlanStep(prev => prev ? { ...prev, isLoading: false, isComplete: true } : null);

        // --- 2. Executor Step ---
        const planItems = plan.split('\n').map(item => item.replace(/^\d+\.\s*/, '').trim()).filter(Boolean);
        const observations: string[] = [];

        for (const item of planItems) {
            const actionStep: ExecutionStep = { type: 'action', title: `Action: Search`, content: item, isComplete: true };
            setExecutionSteps(prev => [...prev, actionStep]);
            await new Promise(res => setTimeout(res, 200));

            const observation = await mockSearch(item);
            observations.push(observation);
            const observationStep: ExecutionStep = { type: 'observation', title: 'Observation', content: observation, isComplete: true };
            setExecutionSteps(prev => [...prev, observationStep]);
            await new Promise(res => setTimeout(res, 500));
        }

        // --- 3. Final Answer Step ---
        const finalPrompt = `You are a helpful assistant. Based on the following information gathered from your tools, provide a comprehensive final answer to the user's original goal.\n\nOriginal Goal: "${goal}"\n\nGathered Information:\n- ${observations.join('\n- ')}\n\nFinal Answer:`;
        const initialFinalStep: FinalAnswerStep = { title: 'Step 3: Synthesize Final Answer', prompt: finalPrompt, answer: '', isLoading: true, isComplete: false };
        setFinalAnswerStep(initialFinalStep);

        let finalAnswer = '';
        for await (const chunk of streamGeminiResponse(finalPrompt)) {
            finalAnswer += chunk;
            setFinalAnswerStep(prev => prev ? { ...prev, answer: finalAnswer } : null);
        }
        setFinalAnswerStep(prev => prev ? { ...prev, isLoading: false, isComplete: true } : null);
        
        setIsLoading(false);
    }, [goal]);

    const isChainComplete = finalAnswerStep?.isComplete;

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <label htmlFor="goal-input" className="block text-sm font-medium text-gray-400">
                    Enter a complex goal:
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        id="goal-input"
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm"
                        placeholder="Enter a multi-step goal..."
                        disabled={isLoading}
                    />
                    <button
                        onClick={runChain}
                        disabled={isLoading || !goal}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 text-sm"
                    >
                        {isLoading ? <><Spinner /> <span role="status">Running...</span></> : 'Run Chain'}
                    </button>
                </div>
            </div>
            
            <div className="space-y-3">
                {planStep && (
                     <div className={`bg-gray-800/50 border rounded-lg transition-all duration-300 ease-in-out ${planStep.isComplete ? 'border-green-500/30' : 'border-gray-700'}`}>
                        <div className="p-3 flex items-center justify-between border-b border-gray-700/50">
                            <h4 className="font-semibold text-base flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${planStep.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'} ${planStep.isLoading ? 'animate-pulse' : ''}`}>
                                    {planStep.isLoading ? <Spinner className="w-4 h-4" /> : <CheckIcon className="w-5 h-5" />}
                                </div>
                                {planStep.title}
                            </h4>
                        </div>
                        <div className="p-3">
                             <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Output: Generated Plan</p>
                                <div className="text-gray-300 whitespace-pre-wrap bg-gray-900/20 p-2.5 rounded-md min-h-[2.5em] text-sm">
                                    {planStep.plan}
                                    {planStep.isLoading && <span className="inline-block w-0.5 h-4 bg-gray-300 animate-pulse ml-1 align-[-2px]" />}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {executionSteps.length > 0 && (
                     <div className={`bg-gray-800/50 border rounded-lg transition-all duration-300 ease-in-out border-green-500/30`}>
                        <div className="p-3 flex items-center justify-between border-b border-gray-700/50">
                            <h4 className="font-semibold text-base flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm bg-green-500/20 text-green-400">
                                    <CheckIcon className="w-5 h-5" />
                                </div>
                                Step 2: Execute Plan
                            </h4>
                        </div>
                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {executionSteps.map((step, index) => (
                                <div key={index}>
                                    <p className="text-sm font-semibold text-gray-400 mb-1 flex items-center gap-2">
                                        {step.type === 'action' ? <ActionIcon /> : <ObservationIcon />}
                                        {step.title}
                                    </p>
                                    <div className="text-gray-300 text-sm whitespace-pre-wrap bg-gray-900/20 p-2.5 rounded-md break-words">
                                        {step.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {finalAnswerStep && (
                     <div className={`bg-gray-800/50 border rounded-lg transition-all duration-300 ease-in-out ${finalAnswerStep.isComplete ? 'border-green-500/30' : 'border-gray-700'}`}>
                        <div className="p-3 flex items-center justify-between border-b border-gray-700/50">
                            <h4 className="font-semibold text-base flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${finalAnswerStep.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'} ${finalAnswerStep.isLoading ? 'animate-pulse' : ''}`}>
                                    {finalAnswerStep.isLoading ? <Spinner className="w-4 h-4" /> : <AnswerIcon />}
                                </div>
                                {finalAnswerStep.title}
                            </h4>
                        </div>
                        <div className="p-3">
                             <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Final Answer</p>
                                <div className="text-gray-300 whitespace-pre-wrap bg-gray-900/20 p-2.5 rounded-md min-h-[2.5em] text-sm">
                                    {finalAnswerStep.answer}
                                    {finalAnswerStep.isLoading && <span className="inline-block w-0.5 h-4 bg-gray-300 animate-pulse ml-1 align-[-2px]" />}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {isChainComplete && runId && (
              <Feedback runId={`planner-executor-${runId}`} />
            )}
        </div>
    );
};

export default PlannerExecutorDemo;