import type { Strategy } from './types';
import { StrategyId } from './types';
import SimpleChainDemo from './components/demos/SimpleChainDemo';
import SequentialChainDemo from './components/demos/SequentialChainDemo';
import RouterChainDemo from './components/demos/RouterChainDemo';
import AgentExecutorDemo from './components/demos/AgentExecutorDemo';
import MapReduceDemo from './components/demos/MapReduceDemo';
import ReflexionDemo from './components/demos/ReflexionDemo';
import PlannerExecutorDemo from './components/demos/PlannerExecutorDemo';
import TreeOfThoughtsDemo from './components/demos/TreeOfThoughtsDemo';

export const STRATEGIES: Strategy[] = [
  {
    id: StrategyId.SIMPLE,
    name: 'Simple Chain',
    description: 'The most basic chaining strategy. The output of one LLM call is used as the direct input for a second LLM call. This is useful for building upon an initial idea or refining a piece of generated text.',
    useCases: [
        'Drafting an email where the first LLM call generates a subject line and the second writes the body.',
        'Creating simple content pipelines, like generating a blog post title and then its introductory paragraph.',
    ],
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
    useCases: [
        'Automated report generation: fetch data (step 1), summarize key findings (step 2), format into a report (step 3).',
        'Customer support ticket processing: classify issue type, extract relevant entities, draft a tailored response.',
    ],
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
    useCases: [
        'Building multi-skilled chatbots that route queries to different "expert" prompts (e.g., customer service vs. sales).',
        'API routing where an LLM determines which of several backend services or tools to call based on natural language input.',
    ],
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
    useCases: [
        'Complex question-answering systems that require real-time data from external APIs (e.g., weather, stock prices).',
        'Building autonomous agents that can interact with software, like a booking assistant that uses calendar and email tools.',
    ],
    tools: [
      {
        name: 'Calculator',
        description: 'A tool that evaluates mathematical expressions.',
        usage: "Used when the user's query contains explicit math (e.g., '5*12', '2^3'). The agent identifies the mathematical part of the query and passes it to this tool for accurate computation."
      },
      {
        name: 'Search API',
        description: 'A tool that searches for real-time or external information from a knowledge base or the web.',
        usage: "Used for questions the LLM cannot answer from its internal knowledge, like current events ('what is the weather in London?'), specific facts ('who is the CEO of SpaceX?'), or up-to-date data."
      }
    ],
    implementation: {
        overview: "A practical implementation involves a central 'agent' loop that takes user input, uses an LLM ('the brain') to decide the next action (use a tool or respond), executes the action, and feeds the result ('observation') back into the loop. This Reason-Act (ReAct) cycle continues until the agent has enough information for a final answer.",
        dependencies: ["LLM API Client (e.g., @google/genai)", "Tool/API client libraries (e.g., a weather API client, database connector)", "A safe expression parser for the calculator (to avoid `eval()`)"],
        requirements: ["Well-defined tools with clear descriptions so the LLM knows what they do.", "Robust error handling for when tools fail or return unexpected results.", "A prompting strategy (like ReAct) that encourages the LLM to 'think' through its steps, actions, and observations."]
    },
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
    useCases: [
        'Summarizing or querying large legal or financial documents that exceed a single context window.',
        'Analyzing thousands of customer reviews by processing each one individually (map) and then creating a final summary of themes (reduce).',
    ],
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
    useCases: [
        'Automated code generation and debugging, where the agent writes code, runs tests, reads error output (feedback), and corrects its own mistakes.',
        'Iteratively improving answers in complex reasoning tasks by self-critiquing an initial draft and refining it based on the critique.',
    ],
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
    useCases: [
        'Goal-oriented personal assistants that can handle complex requests like "Plan my weekend trip to Napa Valley."',
        'Automating business processes that involve multiple sequential steps and tool interactions, such as new employee onboarding.',
    ],
    tools: [
        {
            name: 'Search API',
            description: 'An external tool used by the Executor to gather information required by a step in the plan.',
            usage: "The Planner creates a step like 'Find the company revenue in 2023'. The Executor then calls the Search tool with that query to get the information needed to complete that specific step."
        }
    ],
    implementation: {
        overview: "This pattern requires two main components. The 'Planner' is an LLM call that takes a high-level goal and outputs a list of discrete, actionable steps. The 'Executor' is a separate agent or loop that iterates through these steps, using tools to gather information or perform actions for each one. The results are then collected and often passed to a final LLM call to synthesize a cohesive answer.",
        dependencies: ["LLM API Client (e.g., @google/genai)", "Client libraries for any tools the executor needs to call."],
        requirements: ["A powerful LLM for the Planner that is good at breaking down complex problems.", "A clear, structured format for the plan (e.g., numbered list, JSON) that the Executor can reliably parse.", "The Executor must be able to maintain state and context between steps."]
    },
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
  {
    id: StrategyId.TREE_OF_THOUGHTS,
    name: 'Tree of Thoughts',
    description: 'An advanced strategy that explores multiple reasoning paths in parallel. Instead of picking one idea, it generates several "thoughts," evaluates them, and then expands on the most promising ones. This tree-like exploration allows it to solve complex problems that require foresight and backtracking.',
    useCases: [
        'Solving complex logical puzzles or math problems where exploring multiple paths is necessary to avoid dead ends.',
        'Advanced strategic planning in simulations or games, allowing an AI to "think ahead" about multiple possible move sequences.',
    ],
    pseudoCode: `
# 1. Define the problem
problem = "Write a story with three possible endings."
num_thoughts = 3

# 2. GENERATE: Create initial thoughts
prompt = f"Generate {num_thoughts} different opening paragraphs for the story: {problem}"
thoughts = llm.generate(prompt, count=num_thoughts)
# -> ["Once upon a time...", "In a neon-lit city...", "The spaceship shuddered..."]

# 3. EVALUATE: Score each thought
evaluations = []
for thought in thoughts:
    eval_prompt = f"How promising is this opening? Score 1-10. '{thought}'"
    score, justification = llm.generate(eval_prompt)
    evaluations.append({'score': score, 'text': thought})

# 4. SELECT: Choose the best thought
best_thought = sorted(evaluations, key=lambda x: x['score'], reverse=True)[0]

# 5. EXPAND/SYNTHESIZE: Continue from the best path
final_prompt = f"Continue the story from this opening: {best_thought['text']}"
final_story = llm.generate(final_prompt)

print(final_story)
    `,
    demoComponent: TreeOfThoughtsDemo,
  },
];