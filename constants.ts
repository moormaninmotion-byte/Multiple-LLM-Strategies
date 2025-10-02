import type { Strategy } from './types';
import { StrategyId } from './types';
import SimpleChainDemo from './components/demos/SimpleChainDemo';
import SequentialChainDemo from './components/demos/SequentialChainDemo';
import RouterChainDemo from './components/demos/RouterChainDemo';
import AgentExecutorDemo from './components/demos/AgentExecutorDemo';
import MapReduceDemo from './components/demos/MapReduceDemo';
import ReflexionDemo from './components/demos/ReflexionDemo';
import PlannerExecutorDemo from './components/demos/PlannerExecutorDemo';

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
  {
    id: StrategyId.MAP_REDUCE,
    name: 'Map-Reduce',
    description: 'A strategy for processing large documents that don\'t fit into a single LLM context window. The document is split into smaller chunks (Map), an LLM processes each chunk in parallel, and then a final LLM call combines the results into a single output (Reduce). Ideal for summarizing long texts or asking questions about a large corpus of information.',
    pseudoCode: `
# 1. Load a large document
large_document = load_text("long_book.txt")

# 2. Split the document into smaller chunks
chunks = split_text(large_document, chunk_size=4000)

# 3. MAP step: Process each chunk independently
map_results = []
for chunk in chunks:
    prompt = f"Summarize the key points in this text: {chunk}"
    summary = llm.generate(prompt)
    map_results.append(summary)

# 4. REDUCE step: Combine the map results
combined_summary = "\\n".join(map_results)
final_prompt = f"Create a final, cohesive summary from the following points: {combined_summary}"
final_result = llm.generate(final_prompt)

print(final_result)
    `,
    demoComponent: MapReduceDemo,
  },
  {
    id: StrategyId.REFLEXION,
    name: 'Reflexion',
    description: 'An advanced agent strategy where an LLM reflects on its past actions to learn and improve. After an initial attempt to solve a task, an evaluator LLM provides feedback. The agent then "reflects" on this feedback to identify its mistakes and generate a plan to improve, before making a second, more informed attempt.',
    pseudoCode: `
# 1. Define the task
task = "Write a Python function to check if a number is prime. Include a docstring."

# 2. First attempt (ACT)
first_attempt = agent.run(task)
# -> might produce code without a docstring

# 3. Evaluate the attempt
evaluator_prompt = f"Did this code meet all requirements? Code: {first_attempt}"
feedback = evaluator_llm.generate(evaluator_prompt)
# -> "The code is functionally correct but is missing the required docstring."

# 4. Reflect on the feedback
reflexion_prompt = f"You failed because: '{feedback}'. How can you improve?"
self_reflection = agent.run(reflexion_prompt)
# -> "I need to add a clear docstring explaining what the function does."

# 5. Retry the task with the reflection in mind
retry_prompt = f"Original task: {task}. Your reflection: {self_reflection}. Try again."
second_attempt = agent.run(retry_prompt)

print(second_attempt)
    `,
    demoComponent: ReflexionDemo,
  },
  {
    id: StrategyId.PLANNER_EXECUTOR,
    name: 'Planner-Executor',
    description: 'A strategy where a "Planner" LLM first breaks down a complex goal into a series of smaller, manageable steps. An "Executor" agent then carries out each step in sequence, potentially using tools for specific tasks. This is highly effective for complex queries that require multiple actions or information gathering.',
    pseudoCode: `
# 1. Define a complex goal
goal = "Find the current CEO of SpaceX and write a short paragraph about their career."

# 2. PLANNER creates a step-by-step plan
planner_prompt = f"Create a plan to achieve this goal: {goal}"
plan = planner_llm.generate(planner_prompt)
# -> 1. Search for "CEO of SpaceX". 2. Research the career of the person found. 3. Write a summary.

# 3. EXECUTOR carries out the plan
# Step 1:
observation_1 = executor.run_tool("Search", "CEO of SpaceX") # -> "Elon Musk"
# Step 2:
observation_2 = executor.run_tool("Search", "Elon Musk career") # -> "Co-founder of Zip2, PayPal, SpaceX, Tesla..."
# Step 3:
final_prompt = f"Write a paragraph about Elon Musk's career using this info: {observation_2}"
final_answer = executor.llm.generate(final_prompt)

print(final_answer)
    `,
    demoComponent: PlannerExecutorDemo,
  },
];
