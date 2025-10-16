# Sales Agent Framework

> **The WordPress of Sales Automation** - Self-host for free, upgrade to managed service for scale.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%203.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Monorepo](https://img.shields.io/badge/Monorepo-Turborepo-orange)](https://turbo.build/)

An open-source framework for building intelligent sales and CRM automation agents. Build powerful sales automation workflows with modular, composable AI agents.

## 🚀 What is Sales Agent Framework?

Sales Agent Framework is a **modular, open-source platform** for building sales and CRM automation. Think of it as the **WordPress of sales automation** - easy to self-host, infinitely extensible, and backed by a growing ecosystem.

### Why Choose Sales Agent Framework?

| Feature | Sales Agent Framework | Clay | Apollo | Outreach |
|---------|----------------------|------|--------|----------|
| **Self-hostable** | ✅ Free | ❌ | ❌ | ❌ |
| **Open Source** | ✅ AGPL-3.0 | ❌ | ❌ | ❌ |
| **No Vendor Lock-in** | ✅ | ❌ | ❌ | ❌ |
| **Customizable** | ✅ Full control | Limited | Limited | Limited |
| **Managed Service** | ✅ Optional | ✅ | ✅ | ✅ |
| **Pricing** | Free → $99/mo | $149/mo | $99/mo | $100/mo |

## 📦 Available Agents

### 🎯 Intelligence Agents
- **CRM Agent** - Salesforce, HubSpot, Pipedrive integration
- **Website Analyzer** - Extract business intelligence from websites
- **Data Analysis** - Analyze sales data and generate insights
- **Lead Verifier** - Verify and score leads
- **Company Research** - Deep company intelligence gathering
- **Social Research** - Twitter/X prospecting and research

### 💬 Communication Agents
- **Email Agent** - Smart email automation with personalization
- **SMS Agent** - Two-way SMS conversations
- **Voice Agent** - Phone call automation (powered by Nio Voice SDK)
- **Slack Agent** - Team collaboration and notifications

### 📊 Workflow Agents
- **Call Analyzer** - Transcribe and analyze sales calls
- **Meeting Notes** - Auto-generate meeting summaries
- **Calendar Agent** - Smart scheduling and availability
- **Back & Forth Handler** - Multi-turn conversation management

### ✍️ Content Agents
- **Newsletter Writer** - AI-powered newsletter generation
- **Newsletter Subscriber** - Manage subscriptions
- **Unsubscribe Handler** - Automated unsubscribe management

### 🔍 Enrichment Agents
- **Pinecone Knowledge Base** - Vector search for sales intel
- **Competitor Analysis** - Track and analyze competitors
- **Personal Assistant** - Administrative task automation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Sales Agent Framework                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Intelligence │  │Communication │  │  Workflow    │     │
│  │   Agents     │  │   Agents     │  │   Agents     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Core Framework                          │  │
│  │  • Agent Base Classes                                │  │
│  │  • Event System                                      │  │
│  │  • Workflow Engine                                   │  │
│  │  • State Management                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           External Services & Integrations                   │
│  CRM • Email • SMS • Voice • LLMs • Vector DBs              │
└─────────────────────────────────────────────────────────────┘
```

## 🚦 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/cogniolab/sales-agent-framework.git
cd sales-agent-framework

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

### Create Your First Agent Workflow

```typescript
import { AgentWorkflow } from '@cognio/core';
import { CRMAgent } from '@cognio/crm';
import { EmailAgent } from '@cognio/email';
import { WebsiteAnalyzer } from '@cognio/website-analyzer';

// Initialize agents
const workflow = new AgentWorkflow({
  name: 'Lead Qualification Pipeline'
});

const websiteAnalyzer = new WebsiteAnalyzer({
  extractFields: ['industry', 'size', 'technologies']
});

const crmAgent = new CRMAgent({
  provider: 'salesforce',
  apiKey: process.env.SALESFORCE_API_KEY
});

const emailAgent = new EmailAgent({
  provider: 'sendgrid',
  apiKey: process.env.SENDGRID_API_KEY
});

// Build workflow
workflow
  .step('analyze', websiteAnalyzer.analyze)
  .step('qualify', async (context) => {
    const { industry, size } = context.data;
    return size > 100 && ['enterprise', 'saas'].includes(industry);
  })
  .step('create-lead', crmAgent.createLead)
  .step('send-email', emailAgent.sendPersonalized);

// Execute
const result = await workflow.execute({
  websiteUrl: 'https://example.com',
  contactEmail: 'founder@example.com'
});

console.log('Lead created:', result.leadId);
```

## 📚 Documentation

### Core Concepts

- **[Getting Started](./docs/getting-started.md)** - Installation and setup
- **[Agent Architecture](./docs/architecture.md)** - How agents work
- **[Workflow Engine](./docs/workflows.md)** - Building automation workflows
- **[API Reference](./docs/api-reference.md)** - Complete API documentation

### Agent Guides

- **[CRM Agent](./packages/crm/README.md)** - Salesforce, HubSpot, Pipedrive
- **[Email Agent](./packages/email/README.md)** - Email automation
- **[Voice Agent](./packages/voice/README.md)** - Phone automation
- **[Website Analyzer](./packages/website-analyzer/README.md)** - Business intelligence extraction

### Examples

- **[Lead Qualification Pipeline](./examples/lead-qualification)** - Automated lead scoring
- **[Outbound SDR Flow](./examples/outbound-sdr)** - Multi-channel outreach
- **[Customer Support](./examples/customer-support)** - Support ticket automation
- **[Sales Pipeline](./examples/sales-pipeline)** - Full sales cycle automation

## 🛠️ Development

### Project Structure

```
sales-agent-framework/
├── packages/                 # All agent packages
│   ├── core/                # Core framework
│   ├── crm/                 # CRM agents
│   ├── email/               # Email agents
│   ├── sms/                 # SMS agents
│   ├── voice/               # Voice agents
│   ├── data-analysis/       # Data analysis
│   ├── website-analyzer/    # Website analyzer
│   └── ...                  # More agents
├── templates/               # Pre-built templates
├── examples/                # Complete examples
└── docs/                    # Documentation
```

### Build Commands

```bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Start development mode
pnpm dev
```

### Adding a New Agent

1. Create package directory: `packages/my-agent/`
2. Add `package.json` with dependencies
3. Implement agent extending `BaseAgent`
4. Add tests
5. Update documentation

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/sales-agent-framework.git
cd sales-agent-framework

# Install dependencies
pnpm install

# Create branch
git checkout -b feature/my-new-agent

# Make changes and test
pnpm test

# Submit PR
```

## 📄 License

### Open Source License

This project is licensed under **AGPL-3.0** - see the [LICENSE](./LICENSE) file.

**Key Points:**
- ✅ Free to use and modify
- ✅ Must share modifications
- ✅ Cannot offer as proprietary hosted service without commercial license
- ✅ Network use = distribution (source must be shared)

### Commercial License

For organizations that want to:
- Use in proprietary applications without source sharing
- Offer as a hosted service without AGPL requirements
- Get white-label deployment rights
- Receive priority support

Contact: licensing@cogniolab.com

### Why AGPL-3.0?

We chose AGPL-3.0 (not MIT) to:
1. **Prevent cloud lock-in** - AWS/Google can't take without contributing back
2. **Enable dual licensing** - Fund development through commercial licenses
3. **Build community** - Encourage contributions from users
4. **Proven model** - Used by Supabase ($3B), GitLab ($15B), MongoDB ($32B)

## 🌟 Roadmap

### Phase 1 (Current) - Core Infrastructure
- ✅ Core framework architecture
- ✅ 6 critical agents (CRM, Email, SMS, Voice, Website Analyzer, Data Analysis)
- ✅ Basic workflow engine
- ✅ Example applications

### Phase 2 - Intelligence Layer
- [ ] Lead scoring algorithms
- [ ] Predictive analytics
- [ ] Sentiment analysis
- [ ] 6 more intelligence agents

### Phase 3 - Advanced Workflows
- [ ] Multi-agent orchestration
- [ ] Conditional branching
- [ ] Error recovery
- [ ] 8 more workflow agents

### Phase 4 - Enterprise Features
- [ ] Self-hosted admin dashboard
- [ ] Managed service offering
- [ ] Advanced analytics
- [ ] Enterprise support

## 🔗 Related Projects

- **[Nio Voice Agent SDK](https://github.com/cogniolab/nio-voice-agent-sdk)** - Voice agent infrastructure (powers Voice Agent)
- **[MicroGPT Agent SDK](https://github.com/cogniolab/microgpt-agent-sdk)** - Enterprise agent framework

## 💬 Community

- **[GitHub Issues](https://github.com/cogniolab/sales-agent-framework/issues)** - Bug reports and feature requests
- **Email** - dev@cogniolab.com

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/cogniolab/sales-agent-framework?style=social)
![GitHub forks](https://img.shields.io/github/forks/cogniolab/sales-agent-framework?style=social)
![GitHub issues](https://img.shields.io/github/issues/cogniolab/sales-agent-framework)
![GitHub pull requests](https://img.shields.io/github/issues-pr/cogniolab/sales-agent-framework)

---

**Built with ❤️ by [Cognio Labs](https://www.cogniolab.com)**

*Sales Agent Framework is the open-source foundation. Upgrade to [Cognio Cloud](https://www.cogniolab.com) for managed service, advanced features, and enterprise support.*
