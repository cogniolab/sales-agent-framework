# @cognio/core

Core framework for Sales Agent Framework. Provides base classes, workflow engine, and type definitions for building intelligent sales automation agents.

## Installation

```bash
npm install @cognio/core
# or
pnpm add @cognio/core
```

## Quick Start

### Creating a Custom Agent

```typescript
import { BaseAgent, AgentContext, AgentConfig } from '@cognio/core';

interface MyAgentInput {
  data: string;
}

interface MyAgentOutput {
  result: string;
  processed: boolean;
}

class MyCustomAgent extends BaseAgent<MyAgentInput, MyAgentOutput> {
  constructor(config: AgentConfig) {
    super(config);
  }

  protected async run(context: AgentContext<MyAgentInput>): Promise<MyAgentOutput> {
    // Your agent logic here
    const result = context.data.data.toUpperCase();

    return {
      result,
      processed: true
    };
  }

  // Optional: Override validation
  protected validateInput(input: MyAgentInput): void {
    super.validateInput(input);
    if (!input.data) {
      throw new Error('Data is required');
    }
  }
}

// Use the agent
const agent = new MyCustomAgent({
  name: 'my-custom-agent',
  description: 'Converts text to uppercase',
  timeout: 5000
});

await agent.initialize();

const result = await agent.execute({ data: 'hello world' });
console.log(result.data); // { result: 'HELLO WORLD', processed: true }
```

### Building Workflows

```typescript
import { AgentWorkflow } from '@cognio/core';

const workflow = new AgentWorkflow({
  name: 'lead-qualification',
  onError: 'stop'
});

// Add sequential steps
workflow
  .step('fetch-data', async (context) => {
    // Fetch lead data
    return { lead: { email: 'john@example.com', score: 75 } };
  })
  .step('validate', async (context) => {
    // Validate lead
    const { lead } = context.data;
    if (!lead.email) throw new Error('Email required');
    return context.data;
  })
  .when(
    // Conditional step
    (context) => context.data.lead.score > 50,
    'qualify',
    async (context) => {
      // Qualify high-scoring leads
      return { ...context.data, qualified: true };
    }
  )
  .step('save', async (context) => {
    // Save to CRM
    console.log('Saving:', context.data);
    return context.data;
  });

// Execute workflow
const result = await workflow.execute({});
console.log(result.success); // true
console.log(result.data); // Final result
console.log(result.steps); // All step results
```

## Core Concepts

### BaseAgent

Abstract base class that all agents extend. Provides:

- **Execution management** - Timeout, retry, error handling
- **Event system** - Listen to agent lifecycle events
- **Validation** - Input validation with override support
- **Context management** - Execution context and history

**Key Methods:**

- `initialize()` - Async initialization
- `execute(input, context?)` - Execute agent with input
- `run(context)` - Main logic (implement in subclass)
- `validateInput(input)` - Input validation (override)
- `onEvent(listener)` - Listen to events
- `close()` - Cleanup resources

**Configuration:**

```typescript
{
  name: string;           // Agent name
  description?: string;   // Description
  timeout?: number;       // Timeout in ms (default: 30000)
  retry?: {              // Retry configuration
    maxAttempts: number; // Max retry attempts (default: 3)
    delay: number;       // Delay between retries (default: 1000)
    backoff?: 'linear' | 'exponential'; // Backoff strategy
    maxDelay?: number;   // Maximum delay
  }
}
```

### AgentWorkflow

Workflow engine for orchestrating multiple agents/steps.

**Features:**

- Sequential execution
- Conditional steps (`.when()`)
- Error handling strategies ('stop', 'continue', 'rollback')
- Event tracking
- Timeout management

**Methods:**

- `step(name, handler, options?)` - Add step
- `when(condition, name, handler)` - Add conditional step
- `execute(input, context?)` - Execute workflow
- `onEvent(listener)` - Listen to workflow events

**Error Handling:**

```typescript
const workflow = new AgentWorkflow({
  name: 'my-workflow',
  onError: 'stop'      // 'stop' | 'continue' | 'rollback'
});
```

### Events

Both `BaseAgent` and `AgentWorkflow` emit events:

**Agent Events:**
- `agent:start` - Agent starting
- `agent:complete` - Agent completed successfully
- `agent:error` - Agent failed

**Workflow Events:**
- `workflow:start` - Workflow starting
- `workflow:complete` - Workflow completed
- `workflow:error` - Workflow failed
- `step:start` - Step starting
- `step:complete` - Step completed
- `step:error` - Step failed

**Usage:**

```typescript
agent.onEvent((event) => {
  console.log(event.type, event.timestamp, event.data);
});
```

### Types

Common types for building agents:

**Core Types:**
- `AgentContext` - Execution context
- `AgentResult` - Execution result
- `AgentConfig` - Agent configuration
- `AgentError` - Agent error class

**Domain Types:**
- `Lead` - Lead data
- `Contact` - Contact data
- `EmailMessage` - Email message
- `SMSMessage` - SMS message

**Provider Types:**
- `CRMProvider` - 'salesforce' | 'hubspot' | 'pipedrive' | 'custom'
- `EmailProvider` - 'sendgrid' | 'ses' | 'smtp' | 'custom'
- `SMSProvider` - 'twilio' | 'vonage' | 'custom'
- `LLMProvider` - 'openai' | 'anthropic' | 'groq' | 'custom'

## Advanced Usage

### Custom Error Handling

```typescript
class MyAgent extends BaseAgent {
  protected async run(context: AgentContext): Promise<any> {
    try {
      // Your logic
    } catch (error) {
      throw new AgentError(
        'Custom error message',
        'CUSTOM_ERROR_CODE',
        { details: error }
      );
    }
  }
}
```

### Step Error Handlers

```typescript
workflow.step('risky-step', handler, {
  onError: async (error, context) => {
    console.error('Step failed:', error);
    // Send alert, log, etc.
  }
});
```

### Metadata and History

```typescript
const result = await agent.execute(input, {
  metadata: { userId: '123', source: 'api' }
});

// Access previous step results in workflow
workflow.step('use-history', async (context) => {
  const previousResults = context.history;
  console.log('Previous steps:', previousResults);
});
```

## API Reference

See [full API documentation](../../docs/api-reference.md).

## Examples

- [Custom Agent](../../examples/custom-agent)
- [Multi-Step Workflow](../../examples/workflow)
- [Error Handling](../../examples/error-handling)

## License

AGPL-3.0 - see [LICENSE](../../LICENSE)
