import React from 'react';

export enum StrategyId {
  SIMPLE = 'simple',
  SEQUENTIAL = 'sequential',
  ROUTER = 'router',
  AGENT_EXECUTOR = 'agent_executor',
  MAP_REDUCE = 'map_reduce',
  REFLEXION = 'reflexion',
  PLANNER_EXECUTOR = 'planner_executor',
}

export interface Strategy {
  id: StrategyId;
  name: string;
  description: string;
  pseudoCode: string;
  demoComponent: React.ComponentType;
}

export interface ChainStep {
  title: string;
  prompt: string;
  output: string;
  isLoading: boolean;
  isComplete: boolean;
}