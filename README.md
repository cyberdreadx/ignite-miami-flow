# 🔥 Ignite Miami Flow - Community Event Platform

## 🎯 Overview

A comprehensive event management platform for Miami's fire performance community, built with React, TypeScript, and Supabase. Features real-time ticketing, QR code validation, payment processing, and community management.

## ✨ Key Features

### 🎫 **Ticketing System**
- Stripe-powered payment processing
- QR code generation and validation
- Real-time ticket verification
- Mobile-optimized ticket display
- Comprehensive analytics and reporting

### 👥 **Community Management**
- Member profiles and role management
- Social feed with posts and comments
- Media sharing and galleries
- Approval workflows for new members

### 📊 **Admin Dashboard**
- Real-time analytics and insights
- Revenue tracking and reporting
- Member management tools
- System diagnostics and monitoring

### 🔧 **System Diagnostics**
- Stripe data validation
- Payment integrity monitoring
- QR code system testing
- Automated issue detection and fixing

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **Payments**: Stripe integration
- **Deployment**: Vite build system
- **Authentication**: Supabase Auth

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase CLI
- Git

### Local Development

```sh
# Clone the repository
git clone https://github.com/cyberdreadx/ignite-miami-flow.git
cd ignite-miami-flow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase and Stripe keys

# Start development server
npm run dev

# In another terminal, start Supabase (optional for local development)
npx supabase start
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin dashboard components
│   ├── diagnostics/    # System diagnostic tools
│   ├── events/         # Event-related components
│   ├── tickets/        # Ticketing system components
│   └── ui/             # Base UI components
├── pages/              # Page components and routes
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── contexts/           # React context providers
└── utils/              # Utility functions

supabase/
├── functions/          # Edge functions for serverless logic
├── migrations/         # Database schema migrations
└── config.toml        # Supabase configuration
```

## 🔧 System Administration

### Admin Access
- Navigate to `/admin` for the main dashboard
- Use `/admin/diagnostics` for system health monitoring
- Access `/admin/analytics` for detailed reporting

### Diagnostic Tools
- **Stripe Data Validator**: Verify payment data integrity
- **Ticket Usage Analyzer**: Find incorrectly marked tickets
- **Data Integrity Fixer**: Clean up payment inconsistencies
- **System Health Checker**: Test core functionality

### Supabase Functions
Deploy edge functions for serverless logic:
```sh
# Deploy all functions
npx supabase functions deploy

# Deploy specific function
npx supabase functions deploy verify-and-create-ticket
```

## 🐛 Troubleshooting

### Common Issues

**QR Codes Not Working**
- Check function deployment status in diagnostics
- Verify Stripe webhook configuration
- Ensure proper authentication headers

**Payment Issues**
- Validate Stripe keys in environment
- Check payment data integrity in diagnostics
- Review transaction logs in Stripe dashboard

**Performance Issues**
- Monitor database query performance
- Check edge function response times
- Review client-side error logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Miami fire performance community
- Supabase for backend infrastructure
- Stripe for payment processing
- React and TypeScript communities

---

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/25d21c34-b6fc-441b-9054-fae609c5f6e2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
