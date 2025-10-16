/**
 * CRM Agent
 * Main agent class for CRM operations
 */

import { BaseAgent, AgentContext, AgentConfig, Lead, Contact } from '@cognio/core';
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
} from './types';
import { SalesforceProvider } from './providers/SalesforceProvider';

/**
 * CRM Agent configuration
 */
export interface CRMAgentConfig extends AgentConfig {
  /** CRM configuration */
  crm: CRMConfig;
}

/**
 * CRM operation input
 */
export interface CRMOperationInput {
  /** Operation type */
  operation: 'createLead' | 'getLead' | 'updateLead' | 'deleteLead' | 'searchLeads' |
             'createContact' | 'getContact' | 'updateContact' |
             'createOpportunity' | 'getOpportunity' |
             'createAccount' | 'getAccount';
  /** Operation data */
  data: any;
}

/**
 * CRM Agent for interacting with CRM systems
 */
export class CRMAgent extends BaseAgent<CRMOperationInput, any> {
  private provider: ICRMProvider;

  constructor(config: CRMAgentConfig) {
    super({
      description: 'CRM integration agent',
      ...config
    });

    // Create provider
    this.provider = this.createProvider(config.crm);
  }

  /**
   * Initialize provider
   */
  async initialize(): Promise<void> {
    await this.provider.initialize();
    await super.initialize();
  }

  /**
   * Execute CRM operation
   */
  protected async run(context: AgentContext<CRMOperationInput>): Promise<any> {
    const { operation, data } = context.data;

    switch (operation) {
      case 'createLead':
        return this.provider.createLead(data);

      case 'getLead':
        return this.provider.getLead(data.id);

      case 'updateLead':
        return this.provider.updateLead(data.id, data.updates);

      case 'deleteLead':
        await this.provider.deleteLead(data.id);
        return { success: true };

      case 'searchLeads':
        return this.provider.searchLeads(data);

      case 'createContact':
        return this.provider.createContact(data);

      case 'getContact':
        return this.provider.getContact(data.id);

      case 'updateContact':
        return this.provider.updateContact(data.id, data.updates);

      case 'createOpportunity':
        return this.provider.createOpportunity(data);

      case 'getOpportunity':
        return this.provider.getOpportunity(data.id);

      case 'createAccount':
        return this.provider.createAccount(data);

      case 'getAccount':
        return this.provider.getAccount(data.id);

      default:
        throw new CRMError(
          `Unknown operation: ${operation}`,
          'UNKNOWN_OPERATION'
        );
    }
  }

  /**
   * Convenience method: Create lead
   */
  async createLead(lead: Lead): Promise<CRMLead> {
    const result = await this.execute({
      operation: 'createLead',
      data: lead
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Convenience method: Get lead
   */
  async getLead(id: string): Promise<CRMLead> {
    const result = await this.execute({
      operation: 'getLead',
      data: { id }
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Convenience method: Update lead
   */
  async updateLead(id: string, updates: Partial<Lead>): Promise<CRMLead> {
    const result = await this.execute({
      operation: 'updateLead',
      data: { id, updates }
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Convenience method: Delete lead
   */
  async deleteLead(id: string): Promise<void> {
    const result = await this.execute({
      operation: 'deleteLead',
      data: { id }
    });

    if (!result.success) {
      throw result.error;
    }
  }

  /**
   * Convenience method: Search leads
   */
  async searchLeads(criteria: SearchCriteria): Promise<SearchResult<CRMLead>> {
    const result = await this.execute({
      operation: 'searchLeads',
      data: criteria
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Convenience method: Create contact
   */
  async createContact(contact: Contact): Promise<CRMContact> {
    const result = await this.execute({
      operation: 'createContact',
      data: contact
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Convenience method: Get contact
   */
  async getContact(id: string): Promise<CRMContact> {
    const result = await this.execute({
      operation: 'getContact',
      data: { id }
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Convenience method: Update contact
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<CRMContact> {
    const result = await this.execute({
      operation: 'updateContact',
      data: { id, updates }
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Convenience method: Create opportunity
   */
  async createOpportunity(opportunity: Opportunity): Promise<Opportunity> {
    const result = await this.execute({
      operation: 'createOpportunity',
      data: opportunity
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Convenience method: Get opportunity
   */
  async getOpportunity(id: string): Promise<Opportunity> {
    const result = await this.execute({
      operation: 'getOpportunity',
      data: { id }
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Convenience method: Create account
   */
  async createAccount(account: Account): Promise<Account> {
    const result = await this.execute({
      operation: 'createAccount',
      data: account
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Convenience method: Get account
   */
  async getAccount(id: string): Promise<Account> {
    const result = await this.execute({
      operation: 'getAccount',
      data: { id }
    });

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }

  /**
   * Create provider based on configuration
   */
  private createProvider(config: CRMConfig): ICRMProvider {
    switch (config.provider) {
      case 'salesforce':
        return new SalesforceProvider(config);

      case 'hubspot':
        // TODO: Implement HubSpot provider
        throw new CRMError('HubSpot provider not implemented yet', 'NOT_IMPLEMENTED');

      case 'pipedrive':
        // TODO: Implement Pipedrive provider
        throw new CRMError('Pipedrive provider not implemented yet', 'NOT_IMPLEMENTED');

      default:
        throw new CRMError(
          `Unknown CRM provider: ${config.provider}`,
          'UNKNOWN_PROVIDER'
        );
    }
  }

  /**
   * Close agent and provider
   */
  async close(): Promise<void> {
    await this.provider.close();
    await super.close();
  }
}
