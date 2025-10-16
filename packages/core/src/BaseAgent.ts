/**
 * Base Agent class that all agents extend
 */

import { EventEmitter } from 'eventemitter3';
import {
  AgentConfig,
  AgentContext,
  AgentResult,
  AgentError,
  AgentEvent,
  EventListener,
  RetryConfig
} from './types';

/**
 * Abstract base class for all agents
 */
export abstract class BaseAgent<TInput = any, TOutput = any> extends EventEmitter {
  protected config: AgentConfig;
  protected initialized: boolean = false;

  constructor(config: AgentConfig) {
    super();
    this.config = {
      timeout: 30000, // 30 second default timeout
      retry: {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential'
      },
      ...config
    };
  }

  /**
   * Initialize the agent
   * Override this method to perform async initialization
   */
  async initialize(): Promise<void> {
    this.initialized = true;
    this.emitEvent({
      type: 'agent:start',
      timestamp: new Date(),
      data: { agent: this.config.name }
    });
  }

  /**
   * Execute the agent with input data
   */
  async execute(input: TInput, context?: Partial<AgentContext>): Promise<AgentResult<TOutput>> {
    if (!this.initialized) {
      await this.initialize();
    }

    const executionContext: AgentContext<TInput> = {
      id: this.generateContextId(),
      data: input,
      metadata: context?.metadata || {},
      history: context?.history || [],
      timestamp: new Date()
    };

    const startTime = Date.now();

    try {
      // Validate input
      this.validateInput(input);

      // Execute with timeout
      const result = await this.executeWithTimeout(
        () => this.executeWithRetry(executionContext),
        this.config.timeout!
      );

      const executionTime = Date.now() - startTime;

      const agentResult: AgentResult<TOutput> = {
        success: true,
        data: result,
        executionTime,
        metadata: executionContext.metadata
      };

      this.emitEvent({
        type: 'agent:complete',
        timestamp: new Date(),
        data: agentResult
      });

      return agentResult;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const agentError = this.normalizeError(error);

      const agentResult: AgentResult<TOutput> = {
        success: false,
        error: agentError,
        executionTime,
        metadata: executionContext.metadata
      };

      this.emitEvent({
        type: 'agent:error',
        timestamp: new Date(),
        error: agentError,
        data: agentResult
      });

      return agentResult;
    }
  }

  /**
   * The main execution logic - must be implemented by subclasses
   */
  protected abstract run(context: AgentContext<TInput>): Promise<TOutput>;

  /**
   * Validate input data
   * Override to add custom validation
   */
  protected validateInput(input: TInput): void {
    if (input === null || input === undefined) {
      throw new AgentError('Input cannot be null or undefined', 'INVALID_INPUT');
    }
  }

  /**
   * Execute with retry logic
   */
  private async executeWithRetry(context: AgentContext<TInput>): Promise<TOutput> {
    const retry = this.config.retry!;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= retry.maxAttempts; attempt++) {
      try {
        return await this.run(context);
      } catch (error) {
        lastError = error as Error;

        if (attempt < retry.maxAttempts) {
          // Calculate delay with backoff
          const delay = this.calculateRetryDelay(attempt, retry);
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new AgentError('Execution failed', 'EXECUTION_FAILED');
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
          () => reject(new AgentError('Execution timeout', 'TIMEOUT')),
          timeout
        )
      )
    ]);
  }

  /**
   * Calculate retry delay with backoff
   */
  private calculateRetryDelay(attempt: number, retry: RetryConfig): number {
    if (retry.backoff === 'exponential') {
      const delay = retry.delay * Math.pow(2, attempt - 1);
      return Math.min(delay, retry.maxDelay || delay);
    }
    return retry.delay;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Normalize error to AgentError
   */
  private normalizeError(error: any): AgentError {
    if (error instanceof AgentError) {
      return error;
    }

    if (error instanceof Error) {
      return new AgentError(error.message, 'UNKNOWN_ERROR', { originalError: error });
    }

    return new AgentError(
      String(error),
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }

  /**
   * Generate unique context ID
   */
  private generateContextId(): string {
    return `${this.config.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emit event to listeners
   */
  protected emitEvent(event: AgentEvent): void {
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
   * Close the agent and cleanup resources
   */
  async close(): Promise<void> {
    this.removeAllListeners();
    this.initialized = false;
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Update agent configuration
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
  }
}
