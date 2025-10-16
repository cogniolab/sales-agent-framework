/**
 * Base CRM Provider
 */

import {
  CRMConfig,
  ICRMProvider,
  CRMLead,
  CRMContact,
  Opportunity,
  Account,
  SearchCriteria,
  SearchResult,
  CRMError
} from '../types';
import { Lead, Contact } from '@cognio/core';

/**
 * Abstract base class for CRM providers
 */
export abstract class BaseCRMProvider implements ICRMProvider {
  protected config: CRMConfig;
  protected initialized: boolean = false;

  constructor(config: CRMConfig) {
    this.config = config;
  }

  /**
   * Initialize the provider
   */
  abstract initialize(): Promise<void>;

  /**
   * Create lead
   */
  abstract createLead(lead: Lead): Promise<CRMLead>;

  /**
   * Get lead by ID
   */
  abstract getLead(id: string): Promise<CRMLead>;

  /**
   * Update lead
   */
  abstract updateLead(id: string, updates: Partial<Lead>): Promise<CRMLead>;

  /**
   * Delete lead
   */
  abstract deleteLead(id: string): Promise<void>;

  /**
   * Search leads
   */
  abstract searchLeads(criteria: SearchCriteria): Promise<SearchResult<CRMLead>>;

  /**
   * Create contact
   */
  abstract createContact(contact: Contact): Promise<CRMContact>;

  /**
   * Get contact by ID
   */
  abstract getContact(id: string): Promise<CRMContact>;

  /**
   * Update contact
   */
  abstract updateContact(id: string, updates: Partial<Contact>): Promise<CRMContact>;

  /**
   * Create opportunity
   */
  abstract createOpportunity(opportunity: Opportunity): Promise<Opportunity>;

  /**
   * Get opportunity by ID
   */
  abstract getOpportunity(id: string): Promise<Opportunity>;

  /**
   * Create account
   */
  abstract createAccount(account: Account): Promise<Account>;

  /**
   * Get account by ID
   */
  abstract getAccount(id: string): Promise<Account>;

  /**
   * Close provider
   */
  async close(): Promise<void> {
    this.initialized = false;
  }

  /**
   * Ensure provider is initialized
   */
  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new CRMError(
        'Provider not initialized',
        'NOT_INITIALIZED',
        this.config.provider
      );
    }
  }

  /**
   * Validate configuration
   */
  protected validateConfig(): void {
    if (!this.config.provider) {
      throw new CRMError('Provider is required', 'INVALID_CONFIG');
    }

    if (!this.config.apiKey && !this.config.oauth) {
      throw new CRMError(
        'API key or OAuth credentials required',
        'INVALID_CONFIG',
        this.config.provider
      );
    }
  }
}
