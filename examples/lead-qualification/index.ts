/**
 * Lead Qualification Workflow Example
 *
 * This example demonstrates:
 * 1. Creating a multi-step workflow
 * 2. Integrating with CRM (Salesforce)
 * 3. Conditional logic
 * 4. Event tracking
 *
 * Prerequisites:
 * - SALESFORCE_API_KEY environment variable (format: username:password)
 */

import 'dotenv/config';
import { AgentWorkflow } from '@cognio/core';
import { CRMAgent } from '@cognio/crm';

async function main() {
  console.log('🚀 Lead Qualification Workflow Example\n');

  // Step 1: Initialize CRM Agent
  console.log('Initializing CRM agent...');

  const crmAgent = new CRMAgent({
    name: 'salesforce-crm',
    crm: {
      provider: 'salesforce',
      apiKey: process.env.SALESFORCE_API_KEY || 'demo:demo',
      options: {
        loginUrl: process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com'
      }
    },
    timeout: 10000
  });

  // Listen to CRM agent events
  crmAgent.onEvent((event) => {
    if (event.type === 'agent:complete') {
      console.log(`  ✓ CRM operation completed in ${event.data.executionTime}ms`);
    }
    if (event.type === 'agent:error') {
      console.error(`  ✗ CRM error:`, event.error?.message);
    }
  });

  try {
    await crmAgent.initialize();
    console.log('✓ CRM agent initialized\n');
  } catch (error: any) {
    console.error('✗ Failed to initialize CRM agent');
    console.error('  Make sure SALESFORCE_API_KEY is set');
    console.error(`  Error: ${error.message}\n`);
    console.log('Running in demo mode without actual CRM...\n');
  }

  // Step 2: Create workflow
  console.log('Building lead qualification workflow...');

  const workflow = new AgentWorkflow({
    name: 'lead-qualification-pipeline',
    timeout: 60000,
    onError: 'stop'
  });

  // Listen to workflow events
  workflow.onEvent((event) => {
    if (event.type === 'workflow:start') {
      console.log(`\n📋 Workflow started: ${event.data.workflow}`);
      console.log(`   Steps: ${event.data.steps}\n`);
    }
    if (event.type === 'step:start') {
      console.log(`  → Step: ${event.data.step}`);
    }
    if (event.type === 'step:complete') {
      console.log(`  ✓ Step completed: ${event.data.step}`);
    }
    if (event.type === 'workflow:complete') {
      console.log(`\n✓ Workflow completed in ${event.data.executionTime}ms`);
    }
  });

  // Build workflow
  workflow
    .step('validate-lead', async (context) => {
      // Validate lead data
      const lead = context.data;

      if (!lead.email || !lead.company) {
        throw new Error('Email and company are required');
      }

      return lead;
    })
    .step('calculate-score', async (context) => {
      // Calculate lead score based on various factors
      let score = 0;

      const lead = context.data;

      // Company size indicator
      if (lead.company && lead.company.length > 10) {
        score += 20;
      }

      // Has phone number
      if (lead.phone) {
        score += 15;
      }

      // Has title indicating decision maker
      const decisionMakerTitles = ['ceo', 'cto', 'vp', 'director', 'founder'];
      if (lead.title && decisionMakerTitles.some(t => lead.title.toLowerCase().includes(t))) {
        score += 30;
      }

      // Industry match
      const targetIndustries = ['technology', 'software', 'saas'];
      if (lead.industry && targetIndustries.includes(lead.industry.toLowerCase())) {
        score += 35;
      }

      return {
        ...lead,
        score,
        scoreCalculatedAt: new Date()
      };
    })
    .step('create-in-crm', async (context) => {
      // Create lead in CRM
      try {
        const lead = await crmAgent.createLead({
          firstName: context.data.firstName,
          lastName: context.data.lastName,
          email: context.data.email,
          phone: context.data.phone,
          company: context.data.company,
          title: context.data.title,
          industry: context.data.industry,
          score: context.data.score
        });

        return {
          ...context.data,
          crmId: lead.id,
          crmProviderId: lead.providerId
        };
      } catch (error: any) {
        console.log('  ⚠️  CRM not available, skipping creation');
        return {
          ...context.data,
          crmId: 'demo-' + Date.now()
        };
      }
    })
    .when(
      // Conditional step: Only for high-scoring leads
      (context) => context.data.score >= 60,
      'mark-as-qualified',
      async (context) => {
        // Mark as qualified in CRM
        try {
          if (context.data.crmId && !context.data.crmId.startsWith('demo')) {
            await crmAgent.updateLead(context.data.crmId, {
              status: 'Qualified'
            });
          }
        } catch (error) {
          console.log('  ⚠️  Could not update CRM status');
        }

        return {
          ...context.data,
          status: 'Qualified',
          qualifiedAt: new Date()
        };
      }
    )
    .when(
      // Conditional step: Only for low-scoring leads
      (context) => context.data.score < 60,
      'mark-as-unqualified',
      async (context) => {
        return {
          ...context.data,
          status: 'Unqualified',
          rejectedAt: new Date(),
          rejectionReason: 'Score too low'
        };
      }
    );

  console.log('✓ Workflow built with 5 steps\n');

  // Step 3: Test with sample leads
  const sampleLeads = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0100',
      company: 'Acme Corporation',
      title: 'CTO',
      industry: 'Technology'
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@startup.io',
      company: 'StartupXYZ',
      title: 'Founder & CEO',
      industry: 'SaaS'
    },
    {
      firstName: 'Bob',
      lastName: 'Johnson',
      email: 'bob@smallco.com',
      company: 'SmallCo',
      title: 'Manager'
    }
  ];

  console.log('📊 Processing sample leads...\n');

  for (const lead of sampleLeads) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${lead.firstName} ${lead.lastName} - ${lead.company}`);
    console.log('='.repeat(60));

    const result = await workflow.execute(lead);

    if (result.success) {
      console.log(`\n✅ Lead Processed Successfully`);
      console.log(`   Score: ${result.data.score}`);
      console.log(`   Status: ${result.data.status}`);
      console.log(`   CRM ID: ${result.data.crmId}`);

      if (result.data.status === 'Qualified') {
        console.log(`   🎯 This is a qualified lead!`);
      } else {
        console.log(`   ⚠️  Needs more nurturing`);
      }
    } else {
      console.log(`\n❌ Lead Processing Failed`);
      console.log(`   Error: ${result.error?.message}`);
    }

    console.log(`   Execution time: ${result.executionTime}ms`);
    console.log(`   Steps completed: ${result.steps.filter(s => s.success).length}/${result.steps.length}`);
  }

  // Step 4: Cleanup
  console.log(`\n${'='.repeat(60)}`);
  console.log('Cleaning up...');
  await crmAgent.close();
  console.log('✓ Cleanup complete');

  console.log('\n✨ Example completed successfully!\n');
  console.log('Key Takeaways:');
  console.log('  • Workflows enable multi-step automation');
  console.log('  • Conditional steps allow complex logic');
  console.log('  • Event tracking provides visibility');
  console.log('  • Error handling keeps workflows robust');
  console.log('  • CRM integration is seamless\n');
}

// Run example
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
