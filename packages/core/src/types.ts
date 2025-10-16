/**
 * Core types for Sales Agent Framework
 */

import { z } from 'zod';

/**
 * Agent execution context
 */
export interface AgentContext<T = any> {
  /** Unique context ID */
  id: string;
  /** Input data for the agent */
  data: T;
  /** Metadata */
  metadata: Record<string, any>;
  /** Previous step results */
  history: StepResult[];
  /** Timestamp */
  timestamp: Date;
}

/**
 * Agent execution result
 */
export interface AgentResult<T = any> {
  /** Success status */
  success: boolean;
  /** Result data */
  data?: T;
  /** Error if failed */
  error?: AgentError;
  /** Metadata */
  metadata?: Record<string, any>;
  /** Execution time in ms */
  executionTime?: number;
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  /** Agent name */
  name: string;
  /** Description */
  description?: string;
  /** Version */
  version?: string;
  /** Configuration options */
  options?: Record<string, any>;
  /** Timeout in ms */
  timeout?: number;
  /** Retry configuration */
  retry?: RetryConfig;
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  maxAttempts: number;
  /** Delay between retries in ms */
  delay: number;
  /** Backoff strategy */
  backoff?: 'linear' | 'exponential';
  /** Maximum delay in ms */
  maxDelay?: number;
}

/**
 * Agent error
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

/**
 * Workflow step
 */
export interface WorkflowStep {
  /** Step name */
  name: string;
  /** Step handler */
  handler: StepHandler;
  /** Condition to execute */
  condition?: (context: AgentContext) => boolean | Promise<boolean>;
  /** Error handler */
  onError?: (error: Error, context: AgentContext) => void | Promise<void>;
}

/**
 * Step handler function
 */
export type StepHandler<TInput = any, TOutput = any> = (
  context: AgentContext<TInput>
) => Promise<TOutput> | TOutput;

/**
 * Step result
 */
export interface StepResult {
  /** Step name */
  step: string;
  /** Success status */
  success: boolean;
  /** Result data */
  data?: any;
  /** Error if failed */
  error?: Error;
  /** Start time */
  startedAt: Date;
  /** End time */
  completedAt: Date;
  /** Duration in ms */
  duration: number;
}

/**
 * Workflow configuration
 */
export interface WorkflowConfig {
  /** Workflow name */
  name: string;
  /** Description */
  description?: string;
  /** Timeout in ms */
  timeout?: number;
  /** Error handling strategy */
  onError?: 'stop' | 'continue' | 'rollback';
}

/**
 * Event types
 */
export type AgentEventType =
  | 'agent:start'
  | 'agent:complete'
  | 'agent:error'
  | 'step:start'
  | 'step:complete'
  | 'step:error'
  | 'workflow:start'
  | 'workflow:complete'
  | 'workflow:error';

/**
 * Agent event
 */
export interface AgentEvent<T = any> {
  /** Event type */
  type: AgentEventType;
  /** Timestamp */
  timestamp: Date;
  /** Event data */
  data?: T;
  /** Error if applicable */
  error?: Error;
}

/**
 * Event listener
 */
export type EventListener<T = any> = (event: AgentEvent<T>) => void;

/**
 * Provider configuration
 */
export interface ProviderConfig {
  /** Provider type */
  provider: string;
  /** API key */
  apiKey?: string;
  /** API endpoint */
  endpoint?: string;
  /** Additional options */
  options?: Record<string, any>;
}

/**
 * CRM provider types
 */
export type CRMProvider = 'salesforce' | 'hubspot' | 'pipedrive' | 'custom';

/**
 * Email provider types
 */
export type EmailProvider = 'sendgrid' | 'ses' | 'smtp' | 'custom';

/**
 * SMS provider types
 */
export type SMSProvider = 'twilio' | 'vonage' | 'custom';

/**
 * LLM provider types
 */
export type LLMProvider = 'openai' | 'anthropic' | 'groq' | 'custom';

/**
 * Lead data
 */
export interface Lead {
  /** Lead ID */
  id?: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Email */
  email: string;
  /** Phone */
  phone?: string;
  /** Company */
  company?: string;
  /** Title */
  title?: string;
  /** Industry */
  industry?: string;
  /** Lead source */
  source?: string;
  /** Lead score */
  score?: number;
  /** Status */
  status?: string;
  /** Custom fields */
  customFields?: Record<string, any>;
  /** Created at */
  createdAt?: Date;
  /** Updated at */
  updatedAt?: Date;
}

/**
 * Contact data
 */
export interface Contact {
  /** Contact ID */
  id?: string;
  /** Email */
  email: string;
  /** Name */
  name?: string;
  /** Phone */
  phone?: string;
  /** Custom fields */
  customFields?: Record<string, any>;
}

/**
 * Email message
 */
export interface EmailMessage {
  /** Recipient */
  to: string | string[];
  /** CC */
  cc?: string | string[];
  /** BCC */
  bcc?: string | string[];
  /** Subject */
  subject: string;
  /** Text body */
  text?: string;
  /** HTML body */
  html?: string;
  /** Attachments */
  attachments?: EmailAttachment[];
  /** Reply-to */
  replyTo?: string;
  /** From address */
  from?: string;
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  /** Filename */
  filename: string;
  /** Content */
  content: Buffer | string;
  /** Content type */
  contentType?: string;
}

/**
 * SMS message
 */
export interface SMSMessage {
  /** Recipient phone number */
  to: string;
  /** Message body */
  body: string;
  /** From phone number */
  from?: string;
  /** Media URLs */
  mediaUrls?: string[];
}

/**
 * Validation schemas
 */
export const LeadSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  industry: z.string().optional(),
  source: z.string().optional(),
  score: z.number().min(0).max(100).optional(),
  status: z.string().optional(),
  customFields: z.record(z.any()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const EmailMessageSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  bcc: z.union([z.string().email(), z.array(z.string().email())]).optional(),
  subject: z.string().min(1),
  text: z.string().optional(),
  html: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.any(),
    contentType: z.string().optional()
  })).optional(),
  replyTo: z.string().email().optional(),
  from: z.string().email().optional()
});

export const SMSMessageSchema = z.object({
  to: z.string(),
  body: z.string().min(1),
  from: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional()
});
