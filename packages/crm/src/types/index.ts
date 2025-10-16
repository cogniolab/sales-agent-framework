/**
 * CRM Agent Types
 */

import { Lead, Contact } from '@cognio/core';

/**
 * CRM provider types
 */
export type CRMProviderType = 'salesforce' | 'hubspot' | 'pipedrive' | 'custom';

/**
 * CRM configuration
 */
export interface CRMConfig {
  /** CRM provider */
  provider: CRMProviderType;
  /** API key or access token */
  apiKey?: string;
  /** OAuth credentials */
  oauth?: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
  };
  /** API endpoint (for custom providers) */
  endpoint?: string;
  /** Additional options */
  options?: Record<string, any>;
}

/**
 * CRM operation types
 */
export type CRMOperation =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'search'
  | 'list';

/**
 * CRM lead with provider-specific fields
 */
export interface CRMLead extends Lead {
  /** Provider-specific ID */
  providerId?: string;
  /** Provider name */
  provider?: string;
  /** Raw provider data */
  raw?: any;
}

/**
 * CRM contact with provider-specific fields
 */
export interface CRMContact extends Contact {
  /** Provider-specific ID */
  providerId?: string;
  /** Provider name */
  provider?: string;
  /** Raw provider data */
  raw?: any;
}

/**
 * CRM opportunity
 */
export interface Opportunity {
  /** Opportunity ID */
  id?: string;
  /** Name */
  name: string;
  /** Amount */
  amount?: number;
  /** Stage */
  stage?: string;
  /** Close date */
  closeDate?: Date;
  /** Account ID */
  accountId?: string;
  /** Contact ID */
  contactId?: string;
  /** Probability */
  probability?: number;
  /** Custom fields */
  customFields?: Record<string, any>;
  /** Provider-specific ID */
  providerId?: string;
  /** Created at */
  createdAt?: Date;
  /** Updated at */
  updatedAt?: Date;
}

/**
 * CRM account
 */
export interface Account {
  /** Account ID */
  id?: string;
  /** Company name */
  name: string;
  /** Industry */
  industry?: string;
  /** Website */
  website?: string;
  /** Phone */
  phone?: string;
  /** Address */
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  /** Number of employees */
  employees?: number;
  /** Annual revenue */
  revenue?: number;
  /** Custom fields */
  customFields?: Record<string, any>;
  /** Provider-specific ID */
  providerId?: string;
  /** Created at */
  createdAt?: Date;
  /** Updated at */
  updatedAt?: Date;
}

/**
 * Search criteria
 */
export interface SearchCriteria {
  /** Search query */
  query?: string;
  /** Field filters */
  filters?: Record<string, any>;
  /** Sort field */
  sortBy?: string;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Limit */
  limit?: number;
  /** Offset */
  offset?: number;
}

/**
 * Search result
 */
export interface SearchResult<T> {
  /** Results */
  results: T[];
  /** Total count */
  total: number;
  /** Has more */
  hasMore: boolean;
  /** Next offset */
  nextOffset?: number;
}

/**
 * CRM provider interface
 */
export interface ICRMProvider {
  /** Initialize provider */
  initialize(): Promise<void>;

  /** Create lead */
  createLead(lead: Lead): Promise<CRMLead>;

  /** Get lead by ID */
  getLead(id: string): Promise<CRMLead>;

  /** Update lead */
  updateLead(id: string, updates: Partial<Lead>): Promise<CRMLead>;

  /** Delete lead */
  deleteLead(id: string): Promise<void>;

  /** Search leads */
  searchLeads(criteria: SearchCriteria): Promise<SearchResult<CRMLead>>;

  /** Create contact */
  createContact(contact: Contact): Promise<CRMContact>;

  /** Get contact by ID */
  getContact(id: string): Promise<CRMContact>;

  /** Update contact */
  updateContact(id: string, updates: Partial<Contact>): Promise<CRMContact>;

  /** Create opportunity */
  createOpportunity(opportunity: Opportunity): Promise<Opportunity>;

  /** Get opportunity by ID */
  getOpportunity(id: string): Promise<Opportunity>;

  /** Create account */
  createAccount(account: Account): Promise<Account>;

  /** Get account by ID */
  getAccount(id: string): Promise<Account>;

  /** Close provider */
  close(): Promise<void>;
}

/**
 * CRM errors
 */
export class CRMError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CRMError';
  }
}
