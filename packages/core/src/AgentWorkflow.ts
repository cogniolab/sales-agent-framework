/**
 * Agent Workflow Engine
 * Orchestrates multiple agents in a sequential or conditional workflow
 */

import { EventEmitter } from 'eventemitter3';
import {
  WorkflowConfig,
  WorkflowStep,
  AgentContext,
  StepResult,
  AgentEvent,
  EventListener,
  AgentError
} from './types';

/**
 * Workflow execution result
 */
export interface WorkflowResult<T = any> {
  success: boolean;
  data?: T;
  steps: StepResult[];
  error?: Error;
  executionTime: number;
}

/**
 * Agent Workflow class for building multi-step workflows
 */
export class AgentWorkflow extends EventEmitter {
  private config: WorkflowConfig;
  private steps: WorkflowStep[] = [];
  private context: AgentContext | null = null;

  constructor(config: WorkflowConfig) {
    super();
    this.config = {
      timeout: 300000, // 5 minute default timeout
      onError: 'stop',
      ...config
    };
  }

  /**
   * Add a step to the workflow
   */
  step(name: string, handler: WorkflowStep['handler'], options?: {
    condition?: WorkflowStep['condition'];
    onError?: WorkflowStep['onError'];
  }): this {
    this.steps.push({
      name,
      handler,
      condition: options?.condition,
      onError: options?.onError
    });
    return this;
  }

  /**
   * Add a conditional step
   */
  when(
    condition: (context: AgentContext) => boolean | Promise<boolean>,
    name: string,
    handler: WorkflowStep['handler']
  ): this {
    return this.step(name, handler, { condition });
  }

  /**
   * Execute the workflow
   */
  async execute<TInput = any, TOutput = any>(
    input: TInput,
    initialContext?: Partial<AgentContext>
  ): Promise<WorkflowResult<TOutput>> {
    const startTime = Date.now();

    // Initialize context
    this.context = {
      id: this.generateWorkflowId(),
      data: input,
      metadata: initialContext?.metadata || {},
      history: [],
      timestamp: new Date()
    };

    const stepResults: StepResult[] = [];

    this.emitEvent({
      type: 'workflow:start',
      timestamp: new Date(),
      data: {
        workflow: this.config.name,
        steps: this.steps.length
      }
    });

    try {
      // Execute with timeout
      await this.executeWithTimeout(
        async () => {
          for (const step of this.steps) {
            const stepResult = await this.executeStep(step);
            stepResults.push(stepResult);
            this.context!.history.push(stepResult);

            // Handle errors based on strategy
            if (!stepResult.success) {
              if (this.config.onError === 'stop') {
                throw stepResult.error;
              } else if (this.config.onError === 'rollback') {
                await this.rollback(stepResults);
                throw stepResult.error;
              }
              // 'continue' - keep going
            }
          }
        },
        this.config.timeout!
      );

      const executionTime = Date.now() - startTime;

      const result: WorkflowResult<TOutput> = {
        success: true,
        data: this.context.data as TOutput,
        steps: stepResults,
        executionTime
      };

      this.emitEvent({
        type: 'workflow:complete',
        timestamp: new Date(),
        data: result
      });

      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const workflowError = error instanceof Error ? error : new Error(String(error));

      const result: WorkflowResult<TOutput> = {
        success: false,
        steps: stepResults,
        error: workflowError,
        executionTime
      };

      this.emitEvent({
        type: 'workflow:error',
        timestamp: new Date(),
        error: workflowError,
        data: result
      });

      return result;
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: WorkflowStep): Promise<StepResult> {
    const startTime = Date.now();

    this.emitEvent({
      type: 'step:start',
      timestamp: new Date(),
      data: { step: step.name }
    });

    try {
      // Check condition
      if (step.condition) {
        const shouldExecute = await step.condition(this.context!);
        if (!shouldExecute) {
          return {
            step: step.name,
            success: true,
            data: null,
            startedAt: new Date(startTime),
            completedAt: new Date(),
            duration: Date.now() - startTime
          };
        }
      }

      // Execute handler
      const result = await step.handler(this.context!);

      // Update context data with result
      if (result !== null && result !== undefined) {
        this.context!.data = result;
      }

      const stepResult: StepResult = {
        step: step.name,
        success: true,
        data: result,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime
      };

      this.emitEvent({
        type: 'step:complete',
        timestamp: new Date(),
        data: stepResult
      });

      return stepResult;

    } catch (error) {
      const stepError = error instanceof Error ? error : new Error(String(error));

      // Call step error handler if provided
      if (step.onError) {
        try {
          await step.onError(stepError, this.context!);
        } catch (handlerError) {
          console.error('Error handler failed:', handlerError);
        }
      }

      const stepResult: StepResult = {
        step: step.name,
        success: false,
        error: stepError,
        startedAt: new Date(startTime),
        completedAt: new Date(),
        duration: Date.now() - startTime
      };

      this.emitEvent({
        type: 'step:error',
        timestamp: new Date(),
        error: stepError,
        data: stepResult
      });

      return stepResult;
    }
  }

  /**
   * Rollback executed steps
   */
  private async rollback(_steps: StepResult[]): Promise<void> {
    console.warn('Rollback not implemented yet');
    // TODO: Implement rollback logic
    // Would require steps to define rollback handlers
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new AgentError('Workflow timeout', 'TIMEOUT')),
          timeout
        )
      )
    ]);
  }

  /**
   * Generate unique workflow ID
   */
  private generateWorkflowId(): string {
    return `${this.config.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: AgentEvent): void {
    this.emit('event', event);
    this.emit(event.type, event);
  }

  /**
   * Add event listener
   */
  onEvent(listener: EventListener): void {
    this.on('event', listener);
  }

  /**
   * Remove event listener
   */
  offEvent(listener: EventListener): void {
    this.off('event', listener);
  }

  /**
   * Get workflow configuration
   */
  getConfig(): WorkflowConfig {
    return { ...this.config };
  }

  /**
   * Get current context
   */
  getContext(): AgentContext | null {
    return this.context ? { ...this.context } : null;
  }

  /**
   * Clear workflow steps
   */
  clear(): void {
    this.steps = [];
    this.context = null;
  }
}
