import React from 'react';
import { StrategyId } from '../types';

// --- Reusable Components ---
const DiagramWrapper: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => (
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
                <feOffset in="blur" dx="2" dy="2" result="offsetBlur"/>
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
            
            <style>{`
                .text-label { font-family: 'Poppins', sans-serif; font-size: 10px; fill: #9CA3AF; }
                .text-title { font-family: 'Poppins', sans-serif; font-size: 11px; font-weight: 600; fill: #FFFFFF; pointer-events: none; }
                .llm-node { fill: url(#grad-llm); stroke: #1D4ED8; }
                .data-node { fill: url(#grad-data); stroke: #1F2937; }
                .logic-node { fill: url(#grad-logic); stroke: #5B21B6; }
                .tool-node { fill: url(#grad-tool); stroke: #92400E; }
                .final-node { fill: url(#grad-final); stroke: #047857; }
                .node-shape { stroke-width: 1px; filter: url(#shadow); }
                .path-data { stroke: #6B7280; stroke-width: 1.5px; marker-end: url(#arrowhead); }
                .path-control { stroke: #9CA3AF; stroke-width: 1.5px; marker-end: url(#arrowhead); stroke-dasharray: 4 2; }
            `}</style>
        </defs>
        {children}
    </svg>
);

const Node: React.FC<{ x: number, y: number, shape: 'rect' | 'ellipse' | 'diamond' | 'hexagon', size: { w: number, h: number }, title: string, type: 'llm' | 'data' | 'logic' | 'tool' | 'final', className?: string }> = ({ x, y, shape, size, title, type, className }) => {
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
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm" style={{background: 'linear-gradient(to bottom right, #3B82F6, #1E40AF)'}} /><span>LLM Call</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rotate-45" style={{background: 'linear-gradient(to bottom right, #8B5CF6, #6D28D9)'}} /><span>Logic/Control</span></div>
        <div className="flex items-center gap-2"><div className="w-5 h-4" style={{clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', background: 'linear-gradient(to bottom right, #F59E0B, #B45309)'}} /><span>Tool/API</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-3 rounded-full" style={{background: 'linear-gradient(to bottom right, #6B7280, #374151)'}} /><span>Data</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-sm" style={{background: 'linear-gradient(to bottom right, #10B981, #059669)'}} /><span>Final Output</span></div>
    </div>
);

// --- Individual Diagrams ---

const SimpleChainDiagram: React.FC = () => (
    <DiagramWrapper title="Simple Chain Diagram">
        <SVGContainer viewBox="0 0 580 80" title="Simple Chain Diagram">
            <Node x={10} y={25} shape="ellipse" size={{ w: 100, h: 30 }} title="Input" type="data" />
            <LabeledPath d="M115 40 L165 40" label="Prompt" x={140} y={32} />
            <Node x={170} y={20} shape="rect" size={{ w: 90, h: 40 }} title="LLM 1" type="llm" />
            <LabeledPath d="M265 40 L315 40" label="Output 1" x={290} y={32} />
            <Node x={320} y={20} shape="rect" size={{ w: 90, h: 40 }} title="LLM 2" type="llm" />
            <LabeledPath d="M415 40 L465 40" label="Final Output" x={440} y={32} />
            <Node x={470} y={20} shape="rect" size={{ w: 90, h: 40 }} title="Result" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const SequentialChainDiagram: React.FC = () => (
     <DiagramWrapper title="Sequential Chain Diagram">
        <SVGContainer viewBox="0 0 500 80" title="Sequential Chain Diagram">
            <Node x={10} y={20} shape="rect" size={{ w: 80, h: 40 }} title="LLM 1" type="llm" />
            <LabeledPath d="M95 40 L125 40" label="Data" x={110} y={32} />
            <Node x={130} y={20} shape="rect" size={{ w: 80, h: 40 }} title="LLM 2" type="llm" />
            <LabeledPath d="M215 40 L245 40" label="Data" x={230} y={32} />
            <Node x={250} y={20} shape="rect" size={{ w: 80, h: 40 }} title="LLM 3" type="llm" />
            <LabeledPath d="M335 40 L385 40" label="Final" x={360} y={32} />
            <Node x={390} y={20} shape="rect" size={{ w: 80, h: 40 }} title="Result" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const RouterChainDiagram: React.FC = () => (
    <DiagramWrapper title="Router Chain Diagram">
        <SVGContainer viewBox="0 0 500 180" title="Router Chain Diagram">
            <Node x={10} y={70} shape="diamond" size={{ w: 100, h: 40 }} title="Router LLM" type="logic" />
            <LabeledPath d="M110 90 L 180 40" label="Route" x={155} y={55} type="control" />
            <path d="M110 90 L 180 90" className="path-control opacity-30" />
            <path d="M110 90 L 180 140" className="path-control opacity-30" />
            <Node x={185} y={20} shape="rect" size={{ w: 120, h: 40 }} title="Expert LLM (A)" type="llm" />
            <Node x={185} y={70} shape="rect" size={{ w: 120, h: 40 }} title="Expert LLM (B)" type="llm" className="opacity-30" />
            <Node x={185} y={120} shape="rect" size={{ w: 120, h: 40 }} title="Expert LLM (C)" type="llm" className="opacity-30" />
            <LabeledPath d="M310 40 L 360 80" label="Output" x={345} y={55} />
            <path d="M310 90 Q 330 90, 360 90" className="path-data opacity-30" />
            <path d="M310 140 L 360 100" className="path-data opacity-30" />
            <Node x={365} y={70} shape="rect" size={{ w: 100, h: 40 }} title="Result" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const AgentExecutorDiagram: React.FC = () => (
    <DiagramWrapper title="Agent Executor Diagram">
        <SVGContainer viewBox="0 0 450 160" title="Agent Executor Diagram">
            <Node x={10} y={60} shape="ellipse" size={{ w: 100, h: 30 }} title="User Query" type="data" />
            <LabeledPath d="M115 75 H 165" label="" x={140} y={67} />
            <Node x={170} y={10} shape="diamond" size={{ w: 110, h: 40 }} title="Agent Brain" type="logic" />
            <Node x={10} y={110} shape="hexagon" size={{ w: 100, h: 40 }} title="Tool / API" type="tool" />
            <LabeledPath d="M190 55 C 190 120, 115 120, 115 120" label="Action" x={150} y={90} type="control"/>
            <LabeledPath d="M115 120 C 115 50, 190 50, 190 50" label="Observation" x={150} y={75} />
            <LabeledPath d="M285 30 L 335 30" label="Final Answer" x={310} y={22} />
            <Node x={340} y={10} shape="rect" size={{ w: 100, h: 40 }} title="Result" type="final" />
            <text x={225} y={75} className="text-label">ReAct Loop</text>
        </SVGContainer>
    </DiagramWrapper>
);

const MapReduceDiagram: React.FC = () => (
    <DiagramWrapper title="Map-Reduce Diagram">
        <SVGContainer viewBox="0 0 500 200" title="Map-Reduce Diagram">
            <Node x={200} y={0} shape="ellipse" size={{ w: 100, h: 30 }} title="Large Doc" type="data" />
            <path d="M250 30 V 50" className="path-control" />
            <path d="M60 50 H 440" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
            <path d="M60 50 V 70" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
            <path d="M250 50 V 70" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
            <path d="M440 50 V 70" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
            <text x={250} y={65} textAnchor="middle" className="text-title" fill="#C4B5FD">MAP (In Parallel)</text>
            <Node x={10} y={70} shape="rect" size={{ w: 100, h: 40 }} title="LLM" type="llm" />
            <Node x={200} y={70} shape="rect" size={{ w: 100, h: 40 }} title="LLM" type="llm" />
            <Node x={390} y={70} shape="rect" size={{ w: 100, h: 40 }} title="LLM" type="llm" />
            <LabeledPath d="M60 115 V 135" label="Summary" x={60} y={127} />
            <LabeledPath d="M250 115 V 135" label="Summary" x={250} y={127} />
            <LabeledPath d="M440 115 V 135" label="Summary" x={440} y={127} />
            <path d="M60 135 H 440" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
            <path d="M250 135 V 150" className="path-control" />
            <text x={250} y={145} textAnchor="middle" className="text-title" fill="#C4B5FD">REDUCE</text>
            <Node x={175} y={150} shape="rect" size={{ w: 150, h: 40 }} title="Combine LLM" type="llm" />
            <LabeledPath d="M330 170 H 380" label="Final" x={355} y={162} />
            <Node x={385} y={150} shape="rect" size={{ w: 100, h: 40 }} title="Result" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const ReflexionDiagram: React.FC = () => (
    <DiagramWrapper title="Reflexion Diagram">
        <SVGContainer viewBox="0 0 500 160" title="Reflexion Diagram">
            <Node x={10} y={60} shape="rect" size={{ w: 100, h: 40 }} title="Act (Agent)" type="llm" />
            <LabeledPath d="M115 80 H 195" label="Attempt 1" x={155} y={72} />
            <Node x={200} y={60} shape="diamond" size={{ w: 100, h: 40 }} title="Evaluator" type="logic" />
            <LabeledPath d="M250 105 C 150 140, 60 120, 60 100" label="Feedback" x={150} y={130} type="control" />
            <text x={60} y={45} className="text-label">Reflect & Retry</text>
            <LabeledPath d="M305 80 H 385" label="Final Attempt" x={345} y={72} />
            <Node x={390} y={60} shape="rect" size={{ w: 100, h: 40 }} title="Result" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const PlannerExecutorDiagram: React.FC = () => (
    <DiagramWrapper title="Planner-Executor Diagram">
        <SVGContainer viewBox="0 0 550 160" title="Planner-Executor Diagram">
            <Node x={10} y={60} shape="rect" size={{ w: 100, h: 40 }} title="Planner LLM" type="logic" />
            <LabeledPath d="M115 80 H 165" label="Plan" x={140} y={72} />
            <Node x={170} y={60} shape="ellipse" size={{ w: 100, h: 40 }} title="[Steps]" type="data" />
            <g id="executor">
                <rect x={290} y={0} width={120} height={150} rx={8} fill="#4B5563" fillOpacity="0.1" strokeDasharray="4 2" className="stroke-gray-600" />
                <text x={350} y={20} textAnchor="middle" className="text-title">Executor</text>
                <Node x={300} y={40} shape="hexagon" size={{ w: 100, h: 40 }} title="Tool Call" type="tool" />
                <path d="M350 85 V 105" className="path-data" />
                <Node x={300} y={105} shape="ellipse" size={{ w: 100, h: 30 }} title="Data" type="data" />
            </g>
            <LabeledPath d="M275 80 H 290" label="" x={282.5} y={72} type="control" />
            <LabeledPath d="M415 80 H 435" label="Results" x={435} y={72} />
            <Node x={440} y={60} shape="rect" size={{ w: 100, h: 40 }} title="Result" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);

const TreeOfThoughtsDiagram: React.FC = () => (
    <DiagramWrapper title="Tree of Thoughts Diagram">
        <SVGContainer viewBox="0 0 500 180" title="Tree of Thoughts Diagram">
            <Node x={10} y={70} shape="rect" size={{ w: 80, h: 40 }} title="Generate" type="llm" />
            <LabeledPath d="M95 90 L 140 40" label="Thought A" x={120} y={55} />
            <LabeledPath d="M95 90 L 140 90" label="Thought B" x={120} y={82} />
            <LabeledPath d="M95 90 L 140 140" label="Thought C" x={120} y={125} />
            <Node x={145} y={20} shape="ellipse" size={{ w: 100, h: 40 }} title="Evaluate" type="logic" />
            <Node x={145} y={70} shape="ellipse" size={{ w: 100, h: 40 }} title="Evaluate" type="logic" />
            <Node x={145} y={120} shape="ellipse" size={{ w: 100, h: 40 }} title="Evaluate" type="logic" />
            
            <path d="M250 40 L 320 80" className="path-control" />
            <path d="M250 90 L 320 90" className="path-control" />
            <path d="M250 140 L 320 100" className="path-control" />
            <Node x={325} y={70} shape="diamond" size={{ w: 50, h: 40 }} title="Select" type="logic" />
            
            <LabeledPath d="M380 90 H 420" label="Synthesize" x={400} y={82} />
            <Node x={425} y={70} shape="rect" size={{ w: 70, h: 40 }} title="Result" type="final" />
        </SVGContainer>
    </DiagramWrapper>
);


const StrategyDiagram: React.FC<{ strategyId: StrategyId }> = ({ strategyId }) => {
  switch (strategyId) {
    case StrategyId.SIMPLE: return <SimpleChainDiagram />;
    case StrategyId.SEQUENTIAL: return <SequentialChainDiagram />;
    case StrategyId.ROUTER: return <RouterChainDiagram />;
    case StrategyId.AGENT_EXECUTOR: return <AgentExecutorDiagram />;
    case StrategyId.MAP_REDUCE: return <MapReduceDiagram />;
    case StrategyId.REFLEXION: return <ReflexionDiagram />;
    case StrategyId.PLANNER_EXECUTOR: return <PlannerExecutorDiagram />;
    case StrategyId.TREE_OF_THOUGHTS: return <TreeOfThoughtsDiagram />;
    default: return null;
  }
};

export default StrategyDiagram;