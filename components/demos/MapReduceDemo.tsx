import React, { useState, useCallback } from 'react';
import { streamGeminiResponse } from '../../services/geminiService';
import Spinner from '../Spinner';
import CheckIcon from '../icons/CheckIcon';

const LOREM_IPSUM = `The Industrial Revolution, a period from the 18th to the 19th century, marked a profound transition to new manufacturing processes in Europe and the United States. This era saw the shift from hand production methods to machines, new chemical manufacturing, and iron production processes. The development of machine tools and the rise of the factory system were central to this change.

Key innovations included the steam engine, which powered factories, locomotives, and ships. The textile industry was transformed by inventions like the spinning jenny and the power loom, dramatically increasing production efficiency. These changes not only altered industrial processes but also brought about significant social and economic shifts, including urbanization and the rise of a new working class.

---

The digital revolution, also known as the Third Industrial Revolution, began in the latter half of the 20th century with the advent of digital computers and information technology. This period is characterized by the widespread adoption of digital logic, microprocessors, and later, the internet. It moved economies from being based on mechanical and analog technology to digital technology.

This era has fundamentally changed how we live, work, and communicate. The internet connected the world, creating a global village and enabling instantaneous communication and information sharing. Mobile devices, social media, and cloud computing are all products of this revolution, which continues to evolve with advancements in artificial intelligence and machine learning.

---

Artificial intelligence (AI) and machine learning (ML) represent the forefront of the current technological wave, often considered the Fourth Industrial Revolution. AI refers to the simulation of human intelligence in machines, while ML is a subset of AI that allows systems to learn and improve from experience without being explicitly programmed.

These technologies are being applied across various sectors, including healthcare for diagnostics, finance for fraud detection, and transportation for autonomous vehicles. The potential impact of AI is vast, promising to solve complex problems and drive economic growth. However, it also raises important ethical and societal questions about job displacement, privacy, and bias in algorithms that we are still grappling with today.`;


interface MapStep {
    chunk: string;
    summary: string;
    isLoading: boolean;
    isComplete: boolean;
}

interface ReduceStep {
    combinedSummary: string;
    finalSummary: string;
    isLoading: boolean;
    isComplete: boolean;
}

const MapReduceDemo: React.FC = () => {
    const [document, setDocument] = useState<string>(LOREM_IPSUM);
    const [query, setQuery] = useState<string>('Summarize the key technological shifts described in this document.');
    const [mapSteps, setMapSteps] = useState<MapStep[]>([]);
    const [reduceStep, setReduceStep] = useState<ReduceStep | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const runChain = useCallback(async () => {
        setIsLoading(true);

        // 1. Split
        const chunks = document.split('---').map(c => c.trim()).filter(Boolean);
        const initialMapSteps = chunks.map(chunk => ({
            chunk,
            summary: '',
            isLoading: true,
            isComplete: false
        }));
        setMapSteps(initialMapSteps);
        setReduceStep(null);
        
        // 2. Map
        const mapPromises = chunks.map(async (chunk, index) => {
            const prompt = `${query}\n\nHere is the relevant text chunk:\n"""\n${chunk}\n"""\n\nProvide a concise summary of this chunk.`;
            let summary = '';
            for await (const text of streamGeminiResponse(prompt)) {
                summary += text;
                setMapSteps(prev => {
                    const newSteps = [...prev];
                    newSteps[index].summary = summary;
                    return newSteps;
                });
            }
            setMapSteps(prev => {
                const newSteps = [...prev];
                newSteps[index].isLoading = false;
                newSteps[index].isComplete = true;
                return newSteps;
            });
            return summary;
        });

        const mapResults = await Promise.all(mapPromises);

        // 3. Reduce
        const combined = mapResults.map((summary, i) => `Summary of Chunk ${i+1}:\n${summary}`).join('\n\n');
        const initialReduceStep = {
            combinedSummary: combined,
            finalSummary: '',
            isLoading: true,
            isComplete: false
        };
        setReduceStep(initialReduceStep);

        const reducePrompt = `The following are summaries from different parts of a larger document. Synthesize them into a single, cohesive final answer that addresses the original query.\n\nOriginal Query: ${query}\n\nSummaries:\n"""\n${combined}\n"""\n\nFinal Answer:`;
        let finalSummary = '';
        for await (const text of streamGeminiResponse(reducePrompt)) {
            finalSummary += text;
            setReduceStep(prev => prev ? { ...prev, finalSummary } : null);
        }

        setReduceStep(prev => prev ? { ...prev, isLoading: false, isComplete: true } : null);
        setIsLoading(false);

    }, [document, query]);

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="document-input" className="block text-sm font-medium text-gray-400 mb-2">
                        Large Document (chunks are separated by "---"):
                    </label>
                    <textarea
                        id="document-input"
                        value={document}
                        onChange={(e) => setDocument(e.target.value)}
                        rows={8}
                        className="w-full bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                        placeholder="Enter a large document here..."
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="query-input" className="block text-sm font-medium text-gray-400 mb-2">
                        Query:
                    </label>
                    <div className="flex gap-4">
                        <input
                            id="query-input"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="flex-grow bg-gray-800 border border-gray-600 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="e.g., Summarize this document"
                            disabled={isLoading}
                        />
                        <button
                            onClick={runChain}
                            disabled={isLoading || !document || !query}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-900/50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            {isLoading ? <><Spinner /> Running...</> : 'Run Chain'}
                        </button>
                    </div>
                </div>
            </div>

            {mapSteps.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Map Step ({mapSteps.length} Chunks)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mapSteps.map((step, index) => (
                            <div key={index} className={`bg-gray-800/50 border rounded-lg transition-all duration-300 ease-in-out ${step.isComplete ? 'border-green-500/30' : 'border-gray-700'}`}>
                                <div className="p-4 flex items-center justify-between border-b border-gray-700/50">
                                    <h4 className="font-semibold text-base flex items-center gap-3">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-300 ${step.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'} ${step.isLoading ? 'animate-pulse' : ''}`}>
                                            {step.isLoading ? <Spinner className="w-4 h-4" /> : step.isComplete ? <CheckIcon className="w-4 h-4" /> : <span className="font-mono font-bold">{index + 1}</span>}
                                        </div>
                                        Chunk {index + 1} Summary
                                    </h4>
                                </div>
                                <div className="p-4 space-y-4 max-h-60 overflow-y-auto">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Input Chunk</p>
                                        <p className="text-xs text-gray-400 font-mono bg-gray-900/50 p-2 rounded-md break-all">{step.chunk.substring(0, 100)}...</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Output Summary</p>
                                        <div className="text-gray-300 text-sm whitespace-pre-wrap bg-gray-900/20 p-2 rounded-md min-h-[2em]">
                                            {step.summary}
                                            {step.isLoading && <span className="inline-block w-0.5 h-4 bg-gray-300 animate-pulse ml-1 align-[-2px]" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {reduceStep && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Reduce Step</h3>
                     <div className={`bg-gray-800/50 border rounded-lg transition-all duration-300 ease-in-out ${reduceStep.isComplete ? 'border-green-500/30' : 'border-gray-700'}`}>
                        <div className="p-4 flex items-center justify-between border-b border-gray-700/50">
                            <h4 className="font-semibold text-lg flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${reduceStep.isComplete ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'} ${reduceStep.isLoading ? 'animate-pulse' : ''}`}>
                                    {reduceStep.isLoading ? <Spinner className="w-4 h-4" /> : <CheckIcon className="w-5 h-5" />}
                                </div>
                                Final Summary
                            </h4>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Input (Combined Summaries)</p>
                                <p className="text-sm text-gray-400 font-mono bg-gray-900/50 p-3 rounded-md max-h-40 overflow-y-auto whitespace-pre-wrap">{reduceStep.combinedSummary}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Final Output</p>
                                <div className="text-gray-300 whitespace-pre-wrap bg-gray-900/20 p-3 rounded-md min-h-[2.5em]">
                                    {reduceStep.finalSummary}
                                    {reduceStep.isLoading && <span className="inline-block w-0.5 h-4 bg-gray-300 animate-pulse ml-1 align-[-2px]" />}
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default MapReduceDemo;
