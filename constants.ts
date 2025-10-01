import type { Strategy } from './types';
import { StrategyId } from './types';
import SimpleChainDemo from './components/demos/SimpleChainDemo';
import SequentialChainDemo from './components/demos/SequentialChainDemo';
import RouterChainDemo from './components/demos/RouterChainDemo';
import AgentExecutorDemo from './components/demos/AgentExecutorDemo';

export const STRATEGIES: Strategy[] = [
  {
    id: StrategyId.SIMPLE,
    name: 'Simple Chain',
    description: 'The most basic chaining strategy. The output of one LLM call is used as the direct input for a second LLM call. This is useful for building upon an initial idea or refining a piece of generated text.',
    pseudoCode: `
# 1. First prompt to get a topic
prompt_1 = "Generate a creative title for a sci-fi story."
title = llm.generate(prompt_1)

# 2. Second prompt using the output of the first
prompt_2 = f"Write a short story synopsis based on the title: {title}"
synopsis = llm.generate(prompt_2)

print(synopsis)
    `,
    demoComponent: SimpleChainDemo,
  },
  {
    id: StrategyId.SEQUENTIAL,
    name: 'Sequential Chain',
    description: 'A more complex chain where multiple LLM calls are executed in sequence, each passing its output to the next. This allows for multi-step workflows, like generating content, then summarizing it, and finally translating it.',
    pseudoCode: `
# 1. Get product name from user
product_name = "Cosmic Coffee Beans"

# 2. Generate a marketing slogan
prompt_1 = f"Create a catchy marketing slogan for {product_name}."
slogan = llm.generate(prompt_1)

# 3. Write ad copy using the slogan
prompt_2 = f"Write a short, punchy ad copy for {product_name} using the slogan: '{slogan}'."
ad_copy = llm.generate(prompt_2)

# 4. Translate the ad copy to French
prompt_3 = f"Translate the following ad copy to French: '{ad_copy}'."
translated_copy = llm.generate(prompt_3)

print(translated_copy)
    `,
    demoComponent: SequentialChainDemo,
  },
  {
    id: StrategyId.ROUTER,
    name: 'Router Chain',
    description: 'A dynamic chain that uses a "router" LLM to decide which subsequent "expert" LLM to call based on the user\'s input. This is excellent for building specialized agents that can handle different types of queries (e.g., math, history, coding) by directing the query to the most suitable model.',
    pseudoCode: `
# 1. Get user query
user_query = "What was the cause of the War of 1812?"

# 2. Router LLM determines the topic
router_prompt = f"Categorize the following query. Is it about 'history', 'math', or 'science'? Query: {user_query}"
topic = llm.generate(router_prompt).lower()

# 3. Call the appropriate expert LLM
if topic == "history":
    expert_prompt = f"As a history expert, answer: {user_query}"
    response = history_llm.generate(expert_prompt)
elif topic == "math":
    expert_prompt = f"As a math expert, answer: {user_query}"
    response = math_llm.generate(expert_prompt)
else:
    response = "I can only answer questions about history or math."

print(response)
    `,
    demoComponent: RouterChainDemo,
  },
  {
    id: StrategyId.AGENT_EXECUTOR,
    name: 'Agent Executor',
    description: 'An Agent Executor combines an LLM with a set of tools. The LLM acts as the "brain," deciding which tool to use to answer a complex query that it cannot answer on its own. It can use tools sequentially until it has enough information to formulate a final response.',
    pseudoCode: `
# Define available tools
tools = [Calculator(), WeatherAPI()]

# Initialize the agent with the LLM and tools
agent = AgentExecutor(llm, tools)

# 1. Get user query
user_query = "What is (5 * 12) + 2^3, and what is the weather in London?"

# 2. Agent decides which tool to use first
#    - Thought: "The query has math. I need to use the Calculator."
#    - Action: Calculator(expression="(5 * 12) + 2^3")
#    - Observation: "68"

# 3. Agent decides the next step
#    - Thought: "I have solved the math part. Now I need the weather. I will use the WeatherAPI."
#    - Action: WeatherAPI(location="London")
#    - Observation: "Sunny, 18°C"

# 4. Agent formulates the final answer
#    - Thought: "I have all the information. I can now answer the user."
#    - Final Answer: "The result of the calculation is 68, and the weather in London is sunny at 18°C."
response = agent.run(user_query)

print(response)
    `,
    demoComponent: AgentExecutorDemo,
  },
];
