/**
 * Salesforce CRM Provider
 */

import * as jsforce from 'jsforce';
import { BaseCRMProvider } from './BaseCRMProvider';
import {
  CRMConfig,
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
 * Salesforce provider implementation
 */
export class SalesforceProvider extends BaseCRMProvider {
  private connection: jsforce.Connection | null = null;

  constructor(config: CRMConfig) {
    super({ ...config, provider: 'salesforce' });
  }

  /**
   * Initialize Salesforce connection
   */
  async initialize(): Promise<void> {
    this.validateConfig();

    try {
      this.connection = new jsforce.Connection({
        loginUrl: this.config.options?.loginUrl || 'https://login.salesforce.com'
      });

      if (this.config.oauth) {
        // OAuth flow
        this.connection.accessToken = this.config.oauth.refreshToken;
      } else if (this.config.apiKey) {
        // Username/password flow (for testing only)
        const [username, password] = this.config.apiKey.split(':');
        await this.connection.login(username, password);
      }

      this.initialized = true;
    } catch (error: any) {
      throw new CRMError(
        'Failed to initialize Salesforce',
        'INIT_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Create lead in Salesforce
   */
  async createLead(lead: Lead): Promise<CRMLead> {
    this.ensureInitialized();

    try {
      const sfLead = {
        FirstName: lead.firstName,
        LastName: lead.lastName || 'Unknown',
        Email: lead.email,
        Phone: lead.phone,
        Company: lead.company || 'Unknown',
        Title: lead.title,
        Industry: lead.industry,
        LeadSource: lead.source,
        Status: lead.status || 'New',
        ...lead.customFields
      };

      const result = await this.connection!.sobject('Lead').create(sfLead);

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Unknown error');
      }

      return {
        ...lead,
        id: result.id,
        providerId: result.id,
        provider: 'salesforce',
        raw: result
      };
    } catch (error: any) {
      throw new CRMError(
        'Failed to create lead',
        'CREATE_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Get lead by ID
   */
  async getLead(id: string): Promise<CRMLead> {
    this.ensureInitialized();

    try {
      const result = await this.connection!.sobject('Lead').retrieve(id);

      return this.mapSalesforceLead(result);
    } catch (error: any) {
      throw new CRMError(
        'Failed to get lead',
        'READ_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Update lead
   */
  async updateLead(id: string, updates: Partial<Lead>): Promise<CRMLead> {
    this.ensureInitialized();

    try {
      const sfUpdates: any = {
        Id: id,
        FirstName: updates.firstName,
        LastName: updates.lastName,
        Email: updates.email,
        Phone: updates.phone,
        Company: updates.company,
        Title: updates.title,
        Industry: updates.industry,
        Status: updates.status,
        ...updates.customFields
      };

      // Remove undefined values
      Object.keys(sfUpdates).forEach(key =>
        sfUpdates[key] === undefined && delete sfUpdates[key]
      );

      const result: any = await this.connection!.sobject('Lead').update(sfUpdates);

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Unknown error');
      }

      return this.getLead(id);
    } catch (error: any) {
      throw new CRMError(
        'Failed to update lead',
        'UPDATE_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Delete lead
   */
  async deleteLead(id: string): Promise<void> {
    this.ensureInitialized();

    try {
      const result = await this.connection!.sobject('Lead').delete(id);

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Unknown error');
      }
    } catch (error: any) {
      throw new CRMError(
        'Failed to delete lead',
        'DELETE_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Search leads
   */
  async searchLeads(criteria: SearchCriteria): Promise<SearchResult<CRMLead>> {
    this.ensureInitialized();

    try {
      let query = 'SELECT Id, FirstName, LastName, Email, Phone, Company, Title, Industry, LeadSource, Status FROM Lead';

      // Add filters
      if (criteria.query || criteria.filters) {
        query += ' WHERE ';
        const conditions: string[] = [];

        if (criteria.query) {
          conditions.push(`Email LIKE '%${criteria.query}%' OR Company LIKE '%${criteria.query}%'`);
        }

        if (criteria.filters) {
          Object.entries(criteria.filters).forEach(([key, value]) => {
            conditions.push(`${key} = '${value}'`);
          });
        }

        query += conditions.join(' AND ');
      }

      // Add sorting
      if (criteria.sortBy) {
        query += ` ORDER BY ${criteria.sortBy} ${criteria.sortOrder || 'ASC'}`;
      }

      // Add limit
      const limit = criteria.limit || 100;
      query += ` LIMIT ${limit}`;

      // Add offset
      if (criteria.offset) {
        query += ` OFFSET ${criteria.offset}`;
      }

      const result = await this.connection!.query(query);

      const leads: CRMLead[] = result.records.map((record: any) => this.mapSalesforceLead(record));

      return {
        results: leads,
        total: result.totalSize,
        hasMore: !result.done,
        nextOffset: criteria.offset ? criteria.offset + leads.length : leads.length
      };
    } catch (error: any) {
      throw new CRMError(
        'Failed to search leads',
        'SEARCH_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Create contact
   */
  async createContact(contact: Contact): Promise<CRMContact> {
    this.ensureInitialized();

    try {
      const sfContact = {
        Email: contact.email,
        FirstName: contact.name?.split(' ')[0],
        LastName: contact.name?.split(' ').slice(1).join(' ') || 'Unknown',
        Phone: contact.phone,
        ...contact.customFields
      };

      const result = await this.connection!.sobject('Contact').create(sfContact);

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Unknown error');
      }

      return {
        ...contact,
        id: result.id,
        providerId: result.id,
        provider: 'salesforce',
        raw: result
      };
    } catch (error: any) {
      throw new CRMError(
        'Failed to create contact',
        'CREATE_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Get contact by ID
   */
  async getContact(id: string): Promise<CRMContact> {
    this.ensureInitialized();

    try {
      const result = await this.connection!.sobject('Contact').retrieve(id);

      return this.mapSalesforceContact(result);
    } catch (error: any) {
      throw new CRMError(
        'Failed to get contact',
        'READ_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Update contact
   */
  async updateContact(id: string, updates: Partial<Contact>): Promise<CRMContact> {
    this.ensureInitialized();

    try {
      const sfUpdates: any = {
        Id: id,
        Email: updates.email,
        Phone: updates.phone,
        ...updates.customFields
      };

      if (updates.name) {
        sfUpdates.FirstName = updates.name.split(' ')[0];
        sfUpdates.LastName = updates.name.split(' ').slice(1).join(' ');
      }

      Object.keys(sfUpdates).forEach(key =>
        sfUpdates[key] === undefined && delete sfUpdates[key]
      );

      const result: any = await this.connection!.sobject('Contact').update(sfUpdates);

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Unknown error');
      }

      return this.getContact(id);
    } catch (error: any) {
      throw new CRMError(
        'Failed to update contact',
        'UPDATE_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Create opportunity
   */
  async createOpportunity(opportunity: Opportunity): Promise<Opportunity> {
    this.ensureInitialized();

    try {
      const sfOpp = {
        Name: opportunity.name,
        Amount: opportunity.amount,
        StageName: opportunity.stage || 'Prospecting',
        CloseDate: opportunity.closeDate || new Date(),
        AccountId: opportunity.accountId,
        Probability: opportunity.probability,
        ...opportunity.customFields
      };

      const result = await this.connection!.sobject('Opportunity').create(sfOpp);

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Unknown error');
      }

      return {
        ...opportunity,
        id: result.id,
        providerId: result.id
      };
    } catch (error: any) {
      throw new CRMError(
        'Failed to create opportunity',
        'CREATE_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Get opportunity by ID
   */
  async getOpportunity(id: string): Promise<Opportunity> {
    this.ensureInitialized();

    try {
      const result = await this.connection!.sobject('Opportunity').retrieve(id);

      return this.mapSalesforceOpportunity(result);
    } catch (error: any) {
      throw new CRMError(
        'Failed to get opportunity',
        'READ_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Create account
   */
  async createAccount(account: Account): Promise<Account> {
    this.ensureInitialized();

    try {
      const sfAccount = {
        Name: account.name,
        Industry: account.industry,
        Website: account.website,
        Phone: account.phone,
        NumberOfEmployees: account.employees,
        AnnualRevenue: account.revenue,
        ...account.customFields
      };

      if (account.address) {
        Object.assign(sfAccount, {
          BillingStreet: account.address.street,
          BillingCity: account.address.city,
          BillingState: account.address.state,
          BillingPostalCode: account.address.postalCode,
          BillingCountry: account.address.country
        });
      }

      const result = await this.connection!.sobject('Account').create(sfAccount);

      if (!result.success) {
        throw new Error(result.errors?.join(', ') || 'Unknown error');
      }

      return {
        ...account,
        id: result.id,
        providerId: result.id
      };
    } catch (error: any) {
      throw new CRMError(
        'Failed to create account',
        'CREATE_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Get account by ID
   */
  async getAccount(id: string): Promise<Account> {
    this.ensureInitialized();

    try {
      const result = await this.connection!.sobject('Account').retrieve(id);

      return this.mapSalesforceAccount(result);
    } catch (error: any) {
      throw new CRMError(
        'Failed to get account',
        'READ_FAILED',
        'salesforce',
        error
      );
    }
  }

  /**
   * Map Salesforce lead to CRMLead
   */
  private mapSalesforceLead(sfLead: any): CRMLead {
    return {
      id: sfLead.Id,
      providerId: sfLead.Id,
      provider: 'salesforce',
      firstName: sfLead.FirstName,
      lastName: sfLead.LastName,
      email: sfLead.Email,
      phone: sfLead.Phone,
      company: sfLead.Company,
      title: sfLead.Title,
      industry: sfLead.Industry,
      source: sfLead.LeadSource,
      status: sfLead.Status,
      createdAt: sfLead.CreatedDate ? new Date(sfLead.CreatedDate) : undefined,
      updatedAt: sfLead.LastModifiedDate ? new Date(sfLead.LastModifiedDate) : undefined,
      raw: sfLead
    };
  }

  /**
   * Map Salesforce contact to CRMContact
   */
  private mapSalesforceContact(sfContact: any): CRMContact {
    return {
      id: sfContact.Id,
      providerId: sfContact.Id,
      provider: 'salesforce',
      email: sfContact.Email,
      name: `${sfContact.FirstName || ''} ${sfContact.LastName || ''}`.trim(),
      phone: sfContact.Phone,
      raw: sfContact
    };
  }

  /**
   * Map Salesforce opportunity to Opportunity
   */
  private mapSalesforceOpportunity(sfOpp: any): Opportunity {
    return {
      id: sfOpp.Id,
      providerId: sfOpp.Id,
      name: sfOpp.Name,
      amount: sfOpp.Amount,
      stage: sfOpp.StageName,
      closeDate: sfOpp.CloseDate ? new Date(sfOpp.CloseDate) : undefined,
      accountId: sfOpp.AccountId,
      probability: sfOpp.Probability,
      createdAt: sfOpp.CreatedDate ? new Date(sfOpp.CreatedDate) : undefined,
      updatedAt: sfOpp.LastModifiedDate ? new Date(sfOpp.LastModifiedDate) : undefined
    };
  }

  /**
   * Map Salesforce account to Account
   */
  private mapSalesforceAccount(sfAccount: any): Account {
    return {
      id: sfAccount.Id,
      providerId: sfAccount.Id,
      name: sfAccount.Name,
      industry: sfAccount.Industry,
      website: sfAccount.Website,
      phone: sfAccount.Phone,
      employees: sfAccount.NumberOfEmployees,
      revenue: sfAccount.AnnualRevenue,
      address: {
        street: sfAccount.BillingStreet,
        city: sfAccount.BillingCity,
        state: sfAccount.BillingState,
        postalCode: sfAccount.BillingPostalCode,
        country: sfAccount.BillingCountry
      },
      createdAt: sfAccount.CreatedDate ? new Date(sfAccount.CreatedDate) : undefined,
      updatedAt: sfAccount.LastModifiedDate ? new Date(sfAccount.LastModifiedDate) : undefined
    };
  }

  /**
   * Close connection
   */
  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.logout();
      this.connection = null;
    }
    await super.close();
  }
}
