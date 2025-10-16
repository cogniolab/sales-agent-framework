# @cognio/crm

CRM integration agent for Salesforce, HubSpot, and Pipedrive. Part of the Sales Agent Framework.

## Installation

```bash
npm install @cognio/crm @cognio/core
# or
pnpm add @cognio/crm @cognio/core
```

## Quick Start

### Salesforce Integration

```typescript
import { CRMAgent } from '@cognio/crm';

const crmAgent = new CRMAgent({
  name: 'my-crm-agent',
  crm: {
    provider: 'salesforce',
    apiKey: 'username:password', // or use OAuth
    options: {
      loginUrl: 'https://login.salesforce.com'
    }
  }
});

await crmAgent.initialize();

// Create a lead
const lead = await crmAgent.createLead({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  company: 'Example Corp',
  title: 'CTO',
  phone: '+1-555-0100'
});

console.log('Lead created:', lead.id);

// Search leads
const results = await crmAgent.searchLeads({
  query: 'Example',
  limit: 10
});

console.log(`Found ${results.total} leads`);

// Update lead
await crmAgent.updateLead(lead.id!, {
  status: 'Qualified'
});

// Get lead
const updatedLead = await crmAgent.getLead(lead.id!);
console.log('Lead status:', updatedLead.status);
```

### Using in Workflows

```typescript
import { AgentWorkflow } from '@cognio/core';
import { CRMAgent } from '@cognio/crm';

const workflow = new AgentWorkflow({
  name: 'lead-qualification'
});

const crmAgent = new CRMAgent({
  name: 'crm',
  crm: {
    provider: 'salesforce',
    apiKey: process.env.SALESFORCE_API_KEY!
  }
});

await crmAgent.initialize();

workflow
  .step('create-lead', async (context) => {
    const lead = await crmAgent.createLead(context.data);
    return { ...context.data, leadId: lead.id };
  })
  .step('qualify', async (context) => {
    // Qualification logic
    const score = calculateLeadScore(context.data);
    return { ...context.data, score };
  })
  .when(
    (context) => context.data.score > 50,
    'update-as-qualified',
    async (context) => {
      await crmAgent.updateLead(context.data.leadId, {
        status: 'Qualified',
        score: context.data.score
      });
      return context.data;
    }
  );

const result = await workflow.execute({
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  company: 'Tech Startup'
});
```

## Supported CRM Providers

### Salesforce

**Status:** ✅ Fully implemented

**Configuration:**

```typescript
{
  provider: 'salesforce',
  apiKey: 'username:password', // or use OAuth
  oauth: {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    refreshToken: 'your-refresh-token'
  },
  options: {
    loginUrl: 'https://login.salesforce.com' // or test.salesforce.com
  }
}
```

**Supported Operations:**
- ✅ Create/Read/Update/Delete Leads
- ✅ Search Leads
- ✅ Create/Read/Update Contacts
- ✅ Create/Read Opportunities
- ✅ Create/Read Accounts

### HubSpot

**Status:** 🚧 Coming soon

Will support:
- Contacts
- Companies
- Deals
- Tickets

### Pipedrive

**Status:** 🚧 Coming soon

Will support:
- Persons
- Organizations
- Deals
- Activities

## API Reference

### CRMAgent

Main agent class for CRM operations.

**Constructor:**

```typescript
new CRMAgent(config: CRMAgentConfig)
```

**Methods:**

- `initialize(): Promise<void>` - Initialize CRM connection
- `createLead(lead: Lead): Promise<CRMLead>` - Create a lead
- `getLead(id: string): Promise<CRMLead>` - Get lead by ID
- `updateLead(id: string, updates: Partial<Lead>): Promise<CRMLead>` - Update lead
- `deleteLead(id: string): Promise<void>` - Delete lead
- `searchLeads(criteria: SearchCriteria): Promise<SearchResult<CRMLead>>` - Search leads
- `createContact(contact: Contact): Promise<CRMContact>` - Create contact
- `getContact(id: string): Promise<CRMContact>` - Get contact
- `updateContact(id: string, updates: Partial<Contact>): Promise<CRMContact>` - Update contact
- `createOpportunity(opportunity: Opportunity): Promise<Opportunity>` - Create opportunity
- `getOpportunity(id: string): Promise<Opportunity>` - Get opportunity
- `createAccount(account: Account): Promise<Account>` - Create account
- `getAccount(id: string): Promise<Account>` - Get account
- `close(): Promise<void>` - Close connection

### Types

**Lead:**

```typescript
interface Lead {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  industry?: string;
  source?: string;
  score?: number;
  status?: string;
  customFields?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
```

**CRMLead:**

```typescript
interface CRMLead extends Lead {
  providerId?: string;    // Provider-specific ID
  provider?: string;       // 'salesforce', 'hubspot', etc.
  raw?: any;              // Raw provider data
}
```

**SearchCriteria:**

```typescript
interface SearchCriteria {
  query?: string;                    // Search query
  filters?: Record<string, any>;     // Field filters
  sortBy?: string;                   // Sort field
  sortOrder?: 'asc' | 'desc';       // Sort order
  limit?: number;                    // Max results
  offset?: number;                   // Pagination offset
}
```

**SearchResult:**

```typescript
interface SearchResult<T> {
  results: T[];          // Result items
  total: number;         // Total count
  hasMore: boolean;      // Has more results
  nextOffset?: number;   // Next offset for pagination
}
```

## Examples

### Error Handling

```typescript
try {
  const lead = await crmAgent.createLead({
    email: 'invalid-email',
    company: 'Test'
  });
} catch (error) {
  if (error instanceof CRMError) {
    console.error('CRM Error:', error.code, error.message);
    console.error('Provider:', error.provider);
    console.error('Details:', error.details);
  }
}
```

### Batch Operations

```typescript
const leads = [
  { email: 'lead1@example.com', company: 'Company 1' },
  { email: 'lead2@example.com', company: 'Company 2' },
  { email: 'lead3@example.com', company: 'Company 3' }
];

const results = await Promise.allSettled(
  leads.map(lead => crmAgent.createLead(lead))
);

const successful = results.filter(r => r.status === 'fulfilled');
const failed = results.filter(r => r.status === 'rejected');

console.log(`Created ${successful.length} leads, ${failed.length} failed`);
```

### Event Tracking

```typescript
crmAgent.onEvent((event) => {
  console.log(`[${event.type}]`, event.timestamp);

  if (event.type === 'agent:complete') {
    console.log('Execution time:', event.data.executionTime);
  }

  if (event.type === 'agent:error') {
    console.error('Error:', event.error);
  }
});
```

## Environment Variables

```bash
# Salesforce
SALESFORCE_USERNAME=your-username
SALESFORCE_PASSWORD=your-password
SALESFORCE_LOGIN_URL=https://login.salesforce.com

# Or use API key format
SALESFORCE_API_KEY=username:password
```

## Troubleshooting

### Authentication Errors

**Salesforce:**
- Verify username/password or OAuth credentials
- Check loginUrl (production vs sandbox)
- Ensure API access is enabled for your user

### Rate Limiting

All providers have rate limits. The agent includes automatic retry with exponential backoff.

```typescript
const crmAgent = new CRMAgent({
  name: 'crm',
  crm: { provider: 'salesforce', apiKey: '...' },
  retry: {
    maxAttempts: 5,
    delay: 2000,
    backoff: 'exponential',
    maxDelay: 30000
  }
});
```

### Field Mapping

Custom fields are passed through `customFields`:

```typescript
await crmAgent.createLead({
  email: 'test@example.com',
  company: 'Test',
  customFields: {
    Custom_Field__c: 'value',  // Salesforce
    customField: 'value'        // HubSpot/Pipedrive
  }
});
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## License

AGPL-3.0 - see [LICENSE](../../LICENSE)
