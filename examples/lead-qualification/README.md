# Lead Qualification Workflow Example

This example demonstrates a complete lead qualification workflow using the Sales Agent Framework.

## What It Does

1. **Validates** lead data (email, company required)
2. **Calculates** lead score based on multiple factors:
   - Company name length (larger companies = higher score)
   - Has phone number (+15 points)
   - Decision maker title (+30 points)
   - Target industry match (+35 points)
3. **Creates** lead in CRM (Salesforce)
4. **Qualifies** or rejects based on score threshold (60+)
5. **Updates** CRM status accordingly

## Prerequisites

- Node.js >= 18.0.0
- Salesforce account (optional - runs in demo mode without)

## Setup

1. Install dependencies (from repository root):
```bash
pnpm install
```

2. Set environment variables:
```bash
export SALESFORCE_API_KEY="username:password"
export SALESFORCE_LOGIN_URL="https://login.salesforce.com"
```

Or create `.env` file:
```env
SALESFORCE_API_KEY=username:password
SALESFORCE_LOGIN_URL=https://login.salesforce.com
```

## Run

```bash
# From this directory
npm start

# Or from repository root
pnpm --filter lead-qualification-example start
```

## Expected Output

```
🚀 Lead Qualification Workflow Example

Initializing CRM agent...
✓ CRM agent initialized

Building lead qualification workflow...
✓ Workflow built with 5 steps

📊 Processing sample leads...

============================================================
Processing: John Doe - Acme Corporation
============================================================

📋 Workflow started: lead-qualification-pipeline
   Steps: 5

  → Step: validate-lead
  ✓ Step completed: validate-lead
  → Step: calculate-score
  ✓ Step completed: calculate-score
  → Step: create-in-crm
  ✓ CRM operation completed in 234ms
  ✓ Step completed: create-in-crm
  → Step: mark-as-qualified
  ✓ CRM operation completed in 156ms
  ✓ Step completed: mark-as-qualified

✓ Workflow completed in 512ms

✅ Lead Processed Successfully
   Score: 85
   Status: Qualified
   CRM ID: 00Q1234567890ABC
   🎯 This is a qualified lead!
   Execution time: 512ms
   Steps completed: 4/5

...
```

## How It Works

### Workflow Structure

```typescript
workflow
  .step('validate-lead', ...)        // Validates input
  .step('calculate-score', ...)      // Scores lead
  .step('create-in-crm', ...)        // Creates in Salesforce
  .when(                             // Conditional execution
    (context) => context.data.score >= 60,
    'mark-as-qualified',
    ...
  )
  .when(
    (context) => context.data.score < 60,
    'mark-as-unqualified',
    ...
  );
```

### Scoring Logic

```typescript
Score breakdown:
- Large company (>10 chars): +20 points
- Has phone number: +15 points
- Decision maker title: +30 points
  (CEO, CTO, VP, Director, Founder)
- Target industry: +35 points
  (Technology, Software, SaaS)

Total possible: 100 points
Qualification threshold: 60 points
```

### CRM Integration

```typescript
const crmAgent = new CRMAgent({
  name: 'salesforce-crm',
  crm: {
    provider: 'salesforce',
    apiKey: process.env.SALESFORCE_API_KEY,
    options: {
      loginUrl: 'https://login.salesforce.com'
    }
  }
});

// Create lead
const lead = await crmAgent.createLead({
  email: 'john@example.com',
  company: 'Acme Corp',
  // ...
});

// Update status
await crmAgent.updateLead(lead.id, {
  status: 'Qualified'
});
```

## Customization

### Modify Scoring

Edit the `calculate-score` step in `index.ts`:

```typescript
.step('calculate-score', async (context) => {
  let score = 0;

  // Add your custom scoring logic
  if (context.data.revenue > 1000000) {
    score += 40;
  }

  if (context.data.employees > 100) {
    score += 30;
  }

  return { ...context.data, score };
})
```

### Add More Steps

```typescript
workflow
  .step('enrich-data', async (context) => {
    // Enrich lead data from external API
    const enriched = await enrichLeadData(context.data.email);
    return { ...context.data, ...enriched };
  })
  .step('send-notification', async (context) => {
    // Send Slack notification for qualified leads
    if (context.data.status === 'Qualified') {
      await sendSlackNotification(context.data);
    }
    return context.data;
  });
```

### Use Different CRM

```typescript
const crmAgent = new CRMAgent({
  name: 'hubspot-crm',
  crm: {
    provider: 'hubspot',  // or 'pipedrive'
    apiKey: process.env.HUBSPOT_API_KEY
  }
});
```

## Next Steps

- Add email automation (see [Email Agent](../../packages/email))
- Add SMS notifications (see [SMS Agent](../../packages/sms))
- Add voice calls (see [Voice Agent](../../packages/voice))
- Build custom agents (see [Core Framework](../../packages/core))

## Learn More

- [Core Framework Documentation](../../packages/core/README.md)
- [CRM Agent Documentation](../../packages/crm/README.md)
- [Sales Agent Framework](../../README.md)

## License

AGPL-3.0 - see [LICENSE](../../LICENSE)
