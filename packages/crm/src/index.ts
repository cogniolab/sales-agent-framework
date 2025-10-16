/**
 * CRM Agent Package
 * Salesforce, HubSpot, and Pipedrive integration
 */

// Main agent
export { CRMAgent } from './CRMAgent';
export type { CRMAgentConfig, CRMOperationInput } from './CRMAgent';

// Providers
export { BaseCRMProvider } from './providers/BaseCRMProvider';
export { SalesforceProvider } from './providers/SalesforceProvider';

// Types
export * from './types';

// Version
export const VERSION = '0.1.0';
