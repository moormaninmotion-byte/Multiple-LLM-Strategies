import React from 'react';
import { StrategyId } from '../types';

// --- Reusable Components ---
const DiagramWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="w-full flex flex-col items-center gap-4">
        {children}
        <Legend />
    </div>
);

const SVGContainer: React.FC<{ children: React.ReactNode, viewBox: string, title: string }> = ({ children, viewBox, title }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} className="w-full h-auto max-w-3xl" aria-labelledby="title" role="img">
        <title id="title">{title}</title>
        <defs>
            <marker id="arrowhead" markerWidth={10} markerHeight={7} refX={9} refY={3.5} orient="auto" className="fill-current text-gray-500"><polygon points="0 0, 10 3.5, 0 7" /></marker>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                <feOffset in="blur" dx="1" dy="1" result="offsetBlur"/>
                <feMerge>
                    <feMergeNode in="offsetBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <linearGradient id="grad-llm" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#1E40AF" /></linearGradient>
            <linearGradient id="grad-data" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6B7280" /><stop offset="100%" stopColor="#374151" /></linearGradient>
            <linearGradient id="grad-logic" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#6D28D9" /></linearGradient>
            <linearGradient id="grad-tool" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B" /><stop offset="100%" stopColor="#B45309" /></linearGradient>
            <linearGradient id="grad-final" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
            <linearGradient id="grad-user" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#16A34A" /><stop offset="100%" stopColor="#15803D" /></linearGradient>
            
            <style>{`
                .text-label { font-family: 'Poppins', sans-serif; font-size: 10px; fill: #9CA3AF; }
                .text-title { font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: 600; fill: #FFFFFF; pointer-events: none; }
                .llm-node { fill: url(#grad-llm); stroke: #1D4ED8; }
                .data-node { fill: url(#grad-data); stroke: #1F2937; }
                .logic-node { fill: url(#grad-logic); stroke: #5B21B6; }
                .tool-node { fill: url(#grad-tool); stroke: #92400E; }
                .final-node { fill: url(#grad-final); stroke: #047857; }
                .user-node { fill: url(#grad-user); stroke: #14532D; }
                .node-shape { stroke-width: 1px; filter: url(#shadow); }
                .path-data { stroke: #6B7280; stroke-width: 1.5px; marker-end: url(#arrowhead); }
                .path-control { stroke: #9CA3AF; stroke-width: 1.5px; marker-end: url(#arrowhead); stroke-dasharray: 4 2; }
            `}</style>
        </defs>
        {children}
    </svg>
);

const Node: React.FC<{ x: number, y: number, shape: 'rect' | 'ellipse' | 'diamond' | 'hexagon', size: { w: number, h: number }, title: string, type: 'llm' | 'data' | 'logic' | 'tool' | 'final' | 'user', className?: string }> = ({ x, y, shape, size, title, type, className }) => {
    const commonProps = { className: `${type}-node node-shape` };
    const ShapeComponent = () => {
        switch (shape) {
            case 'ellipse': return <ellipse cx={size.w / 2} cy={size.h / 2} rx={size.w / 2} ry={size.h / 2} {...commonProps} />;
            case 'diamond': return <path d={`M${size.w / 2} 0 L${size.w} ${size.h / 2} L${size.w / 2} ${size.h} L0 ${size.h / 2} Z`} {...commonProps} />;
            case 'hexagon': return <path d={`M${size.w*0.25} 0 L${size.w*0.75} 0 L${size.w} ${size.h/2} L${size.w*0.75} ${size.h} L${size.w*0.25} ${size.h} L0 ${size.h/2} Z`} {...commonProps} />;
            default: return <rect width={size.w} height={size.h} rx={8} {...commonProps} />;
        }
    };
    return (
        <g transform={`translate(${x}, ${y})`} className={className}>
            <ShapeComponent />
            <text x={size.w / 2} y={size.h / 2 + 1} textAnchor="middle" alignmentBaseline="central" className="text-title">{title}</text>
        </g>
    );
};

const LabeledPath: React.FC<{ d: string, label: string, x: number, y: number, type?: 'data' | 'control' }> = ({ d, label, x, y, type = 'data' }) => (
    <>
        <path d={d} fill="none" className={`path-${type}`} />
        <text x={x} y={y} textAnchor="middle" className="text-label">{label}</text>
    </>
);

const Legend: React.FC = () => (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400 border-t border-gray-700/50 pt-3 mt-2 w-full justify-center">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm" style={{background: 'linear-gradient(to bottom right, #16A34A, #15803D)'}} /><span>User/Input</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm" style={{background: 'linear-gradient(to bottom right, #3B82F6, #1E40AF)'}} /><span>LLM Call</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rotate-45" style={{background: 'linear-gradient(to bottom right, #8B5CF6, #6D28D9)'}} /><span>Logic/Control</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-4" style={{clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', background: 'linear-gradient(to bottom right, #F59E0B, #B45309)'}} /><span>Tool/API</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{background: 'linear-gradient(to bottom right, #6B7280, #374151)'}} /><span>Data</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm" style={{background: 'linear-gradient(to bottom right, #10B981, #059669)'}} /><span>Final Output</span></div>
    </div>
);

// --- Individual Diagrams ---

const SimpleChainDiagram: React.FC = () => (
    <DiagramWrapper>
        <SVGContainer viewBox="0 0 720 80" title="Simple Chain Diagram">
            <Node x={10} y={20} shape="rect" size={{ w: 100, h: 40 }} title="User Input" type="user" />
            <LabeledPath d="M115 40 H 165" label="Topic" x={140} y={32} />
            <Node x={170} y={20} shape="rect" size={{ w: 120, h: 40 }} title="LLM (Title Gen)" type="llm" />
            <LabeledPath d="M295 40 H 345" label="Title" x={320} y={32} />
            <Node x={350} y={20} shape="rect" size={{ w: 140, h: 40 }} title="LLM (Synopsis Gen)" type="llm" />
            <LabeledPath d="M495 40 H 545" label="Synopsis" x={520} y={32} />
            <Node x={550} y={20} shape="rect" size={{ w: 120, h: 40 }} title="Final Synopsis" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const SequentialChainDiagram: React.FC = () => (
     <DiagramWrapper>
        <SVGContainer viewBox="0 0 780 80" title="Sequential Chain Diagram">
            <Node x={10} y={20} shape="rect" size={{ w: 100, h: 40 }} title="User Input" type="user" />
            <LabeledPath d="M115 40 H 165" label="Product" x={140} y={32} />
            <Node x={170} y={20} shape="rect" size={{ w: 120, h: 40 }} title="LLM (Slogan)" type="llm" />
            <LabeledPath d="M295 40 H 345" label="Slogan" x={320} y={32} />
            <Node x={350} y={20} shape="rect" size={{ w: 120, h: 40 }} title="LLM (Ad Copy)" type="llm" />
            <LabeledPath d="M475 40 H 525" label="Ad Copy" x={500} y={32} />
            <Node x={530} y={20} shape="rect" size={{ w: 120, h: 40 }} title="LLM (Translate)" type="llm" />
            <LabeledPath d="M655 40 H 705" label="Translation" x={680} y={32} />
            <Node x={650} y={20} shape="rect" size={{ w: 120, h: 40 }} title="Final Copy" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const RouterChainDiagram: React.FC = () => (
    <DiagramWrapper>
        <SVGContainer viewBox="0 0 580 180" title="Router Chain Diagram">
            <Node x={10} y={70} shape="rect" size={{ w: 100, h: 40 }} title="User Input" type="user" />
            <LabeledPath d="M115 90 H 165" label="User Query" x={140} y={82} />
            <Node x={170} y={70} shape="diamond" size={{ w: 100, h: 40 }} title="Router LLM" type="logic" />
            
            <LabeledPath d="M275 90 L 325 40" label="Topic ('history')" x={290} y={55} type="control" />
            <path d="M275 90 L 325 90" className="path-control opacity-30" />
            <path d="M275 90 L 325 140" className="path-control opacity-30" />
            
            <Node x={330} y={20} shape="rect" size={{ w: 120, h: 40 }} title="History Expert LLM" type="llm" />
            <Node x={330} y={70} shape="rect" size={{ w: 120, h: 40 }} title="Math Expert LLM" type="llm" className="opacity-30" />
            <Node x={330} y={120} shape="rect" size={{ w: 120, h: 40 }} title="Science Expert LLM" type="llm" className="opacity-30" />

            <path d="M455 40 L 505 80" className="path-data" />
            <path d="M455 90 L 505 90" className="path-data opacity-30" />
            <path d="M455 140 L 505 100" className="path-data opacity-30" />
            <Node x={510} y={70} shape="rect" size={{ w: 120, h: 40 }} title="Final Response" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const CustomChainDiagram: React.FC = () => (
    <DiagramWrapper>
        <SVGContainer viewBox="0 0 780 80" title="Custom Chain Diagram">
            <Node x={10} y={20} shape="rect" size={{ w: 100, h: 40 }} title="User Input" type="user" />
            <LabeledPath d="M115 40 H 165" label="Initial Data" x={140} y={32} />
            <Node x={170} y={20} shape="rect" size={{ w: 120, h: 40 }} title="LLM 1" type="llm" />
            <LabeledPath d="M295 40 H 345" label="{{output_1}}" x={320} y={32} />
            <Node x={350} y={20} shape="rect" size={{ w: 120, h: 40 }} title="LLM 2" type="llm" />
            <LabeledPath d="M475 40 H 525" label="{{output_2}}" x={500} y={32} />
            <Node x={530} y={20} shape="rect" size={{ w: 120, h: 40 }} title="LLM 3" type="llm" />
            <LabeledPath d="M655 40 H 705" label="Result" x={680} y={32} />
            <Node x={650} y={20} shape="rect" size={{ w: 120, h: 40 }} title="Final Result" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);


const AgentExecutorDiagram: React.FC = () => (
    <DiagramWrapper>
        <SVGContainer viewBox="0 0 600 200" title="Agent Executor Diagram">
            <Node x={10} y={80} shape="rect" size={{w: 100, h: 40}} title="User Input" type="user" />
            <LabeledPath d="M115 100 H 165" label="User Query" x={140} y={92} />
            <Node x={170} y={80} shape="diamond" size={{w: 120, h: 40}} title="Agent Brain (LLM)" type="logic" />
            <LabeledPath d="M295 100 C 330 60, 360 60, 395 80" label="Action: Calculator" x={345} y={62} type="control" />
            <Node x={400} y={20} shape="hexagon" size={{w: 100, h: 40}} title="Calculator" type="tool" />
            <LabeledPath d="M495 40 C 460 80, 330 80, 295 100" label="Observation: '68'" x={395} y={88} />
            <LabeledPath d="M295 100 C 330 140, 360 140, 395 120" label="Action: Search" x={345} y={138} type="control" />
            <Node x={400} y={140} shape="hexagon" size={{w: 100, h: 40}} title="Search API" type="tool" />
            <LabeledPath d="M495 160 C 460 120, 330 120, 295 100" label="Observation: 'Sunny'" x={395} y={112} />
            <LabeledPath d="M170 100 H 20" label="Final Answer" x={95} y={115} type="control" />
        </SVGContainer>
    </DiagramWrapper>
);

const MapReduceDiagram: React.FC = () => (
    <DiagramWrapper>
        <SVGContainer viewBox="0 0 600 200" title="Map-Reduce Diagram">
            <Node x={10} y={80} shape="rect" size={{ w: 100, h: 40 }} title="User Input" type="user" />
            <LabeledPath d="M115 100 H 165" label="Large Document" x={145} y={92} />
            <Node x={170} y={80} shape="diamond" size={{ w: 80, h: 40 }} title="Splitter" type="logic" />
            <LabeledPath d="M255 100 L 295 40" label="Chunk 1" x={270} y={62} />
            <Node x={300} y={20} shape="rect" size={{ w: 100, h: 40 }} title="Map LLM" type="llm" />
            <LabeledPath d="M255 100 L 295 100" label="Chunk 2" x={270} y={92} />
            <Node x={300} y={80} shape="rect" size={{ w: 100, h: 40 }} title="Map LLM" type="llm" />
            <LabeledPath d="M255 100 L 295 160" label="Chunk 3" x={270} y={122} />
            <Node x={300} y={140} shape="rect" size={{ w: 100, h: 40 }} title="Map LLM" type="llm" />
            <LabeledPath d="M405 40 L 445 90" label="Summary 1" x={435} y={55} />
            <LabeledPath d="M405 100 L 445 100" label="Summary 2" x={435} y={92} />
            <LabeledPath d="M405 160 L 445 110" label="Summary 3" x={435} y={145} />
            <Node x={450} y={80} shape="diamond" size={{ w: 80, h: 40 }} title="Reduce LLM" type="logic" />
            <LabeledPath d="M535 100 H 585" label="Final Summary" x={560} y={92} />
            <Node x={590} y={80} shape="rect" size={{ w: 120, h: 40 }} title="Final Summary" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const ReflexionDiagram: React.FC = () => (
     <DiagramWrapper>
        <SVGContainer viewBox="0 0 600 200" title="Reflexion Diagram">
            <Node x={10} y={20} shape="rect" size={{ w: 100, h: 40 }} title="User Input" type="user" />
            <LabeledPath d="M115 40 H 165" label="Task" x={140} y={32} />
            <Node x={170} y={20} shape="rect" size={{ w: 120, h: 40 }} title="Agent (Attempt 1)" type="llm" />
            <LabeledPath d="M295 40 V 80 H 200" label="Code (Attempt 1)" x={240} y={65} />
            <Node x={170} y={80} shape="rect" size={{ w: 120, h: 40 }} title="Evaluator LLM" type="llm" />
            <LabeledPath d="M170 100 V 140 H 260" label="Feedback" x={215} y={125} type="control" />
            <Node x={250} y={140} shape="rect" size={{ w: 120, h: 40 }} title="Agent (Reflect)" type="logic" />
            <LabeledPath d="M375 160 C 450 160, 450 60, 375 60" label="Self-Reflection" x={450} y={110} type="control" />
            <Node x={250} y={20} shape="rect" size={{ w: 120, h: 40 }} title="Agent (Attempt 2)" type="llm" />
            <LabeledPath d="M375 40 H 425" label="Final Code" x={400} y={32} />
            <Node x={430} y={20} shape="rect" size={{ w: 120, h: 40 }} title="Final Code" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const PlannerExecutorDiagram: React.FC = () => (
     <DiagramWrapper>
        <SVGContainer viewBox="0 0 600 200" title="Planner-Executor Diagram">
            <Node x={10} y={20} shape="rect" size={{ w: 100, h: 40 }} title="User Input" type="user" />
            <LabeledPath d="M115 40 H 165" label="Goal" x={140} y={32} />
            <Node x={170} y={20} shape="rect" size={{ w: 120, h: 40 }} title="Planner LLM" type="llm" />
            <LabeledPath d="M295 40 V 80" label="Plan (steps)" x={280} y={65} />
            <Node x={235} y={80} shape="diamond" size={{ w: 120, h: 40 }} title="Executor Agent" type="logic" />
            <LabeledPath d="M360 100 C 400 60, 430 60, 460 80" label="Action: Search" x={410} y={62} type="control" />
            <Node x={465} y={20} shape="hexagon" size={{ w: 100, h: 40 }} title="Search API" type="tool" />
            <LabeledPath d="M560 40 C 530 80, 400 80, 360 100" label="Observation" x={460} y={88} />
            <path d="M295 125 V 150 A 10 10 0 0 0 305 160 H 325 A 10 10 0 0 0 335 150 V 125" className="path-control" />
            <text x="315" y="170" className="text-label" textAnchor="middle">Loop Steps</text>
            <LabeledPath d="M235 100 H 50" label="Synthesize" x={140} y={92} type="control"/>
            <Node x={10} y={80} shape="rect" size={{ w: 100, h: 40 }} title="Final Answer" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const TreeOfThoughtsDiagram: React.FC = () => (
    <DiagramWrapper>
        <SVGContainer viewBox="0 0 620 200" title="Tree of Thoughts Diagram">
            <Node x={10} y={80} shape="rect" size={{ w: 100, h: 40 }} title="User Input" type="user" />
            <LabeledPath d="M115 100 H 165" label="Problem" x={140} y={92} />
            <Node x={170} y={80} shape="rect" size={{ w: 100, h: 40 }} title="Generator LLM" type="llm" />
            
            <LabeledPath d="M275 100 L 315 40" label="Thought 1" x={290} y={62} />
            <Node x={320} y={20} shape="ellipse" size={{ w: 100, h: 40 }} title="Opening A" type="data" />
            
            <LabeledPath d="M275 100 L 315 100" label="Thought 2" x={290} y={92} />
            <Node x={320} y={80} shape="ellipse" size={{ w: 100, h: 40 }} title="Opening B" type="data" />
            
            <LabeledPath d="M275 100 L 315 160" label="Thought 3" x={290} y={122} />
            <Node x={320} y={140} shape="ellipse" size={{ w: 100, h: 40 }} title="Opening C" type="data" />

            <path d="M425 40 H 455 L 455 90" className="path-control" />
            <path d="M425 100 H 455" className="path-control" />
            <path d="M425 160 H 455 L 455 110" className="path-control" />
            
            <Node x={460} y={80} shape="diamond" size={{ w: 100, h: 40 }} title="Evaluate & Select" type="logic" />
            
            <LabeledPath d="M565 100 H 615" label="Best Thought" x={590} y={92} />
            <Node x={500} y={20} shape="rect" size={{ w: 120, h: 40 }} title="Synthesizer LLM" type="llm" />
             <LabeledPath d="M560 65 V 85" label="" x={550} y={75} />
             <Node x={500} y={140} shape="rect" size={{ w: 120, h: 40 }} title="Final Story" type="final" />
             <LabeledPath d="M560 135 V 115" label="Final Story" x={550} y={125} />
        </SVGContainer>
    </DiagramWrapper>
);


// --- Main Component ---
interface StrategyDiagramProps {
  strategyId: StrategyId;
}

const StrategyDiagram: React.FC<StrategyDiagramProps> = ({ strategyId }) => {
  switch (strategyId) {
    case StrategyId.SIMPLE:
      return <SimpleChainDiagram />;
    case StrategyId.SEQUENTIAL:
      return <SequentialChainDiagram />;
    case StrategyId.ROUTER:
      return <RouterChainDiagram />;
    case StrategyId.CUSTOM:
        return <CustomChainDiagram />;
    case StrategyId.AGENT_EXECUTOR:
        return <AgentExecutorDiagram />;
    case StrategyId.MAP_REDUCE:
        return <MapReduceDiagram />;
    case StrategyId.REFLEXION:
        return <ReflexionDiagram />;
    case StrategyId.PLANNER_EXECUTOR:
        return <PlannerExecutorDiagram />;
    case StrategyId.TREE_OF_THOUGHTS:
        return <TreeOfThoughtsDiagram />;
    default:
      return <div className="text-gray-400">Diagram not available.</div>;
  }
};

export default StrategyDiagram;
