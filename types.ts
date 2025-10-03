import React from 'react';

export enum StrategyId {
  SIMPLE = 'simple',
  SEQUENTIAL = 'sequential',
  ROUTER = 'router',
  AGENT_EXECUTOR = 'agent_executor',
  MAP_REDUCE = 'map_reduce',
  REFLEXION = 'reflexion',
  PLANNER_EXECUTOR = 'planner_executor',
  TREE_OF_THOUGHTS = 'tree_of_thoughts',
}

export type Priority = 'low' | 'medium' | 'high';

export interface ToolDescription {
  name: string;
  description: string;
  usage: string;
}

export interface ImplementationDetails {
  overview: string;
  dependencies: string[];
  requirements: string[];
}

export interface Strategy {
  id: StrategyId;
  name: string;
  description: string;
  useCases: string[];
  pseudoCode: string;
  demoComponent: React.ComponentType;
  tools?: ToolDescription[];
  implementation?: ImplementationDetails;
}

export interface ChainStep {
  title: string;
  prompt: string;
  output: string;
  isLoading: boolean;
  isComplete: boolean;
  priority?: Priority;
}