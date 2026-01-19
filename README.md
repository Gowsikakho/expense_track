# Expense Tracker

A comprehensive personal finance management application built with Next.js, featuring budget tracking, expense management, income monitoring, and detailed analytics with calendar-based visualization.

## Features

### Core Functionality
- **User Authentication** - Secure authentication powered by Clerk
- **Budget Management** - Create, track, and manage multiple budgets with spending limits
- **Expense Tracking** - Add, categorize, and monitor daily expenses
- **Income & Savings** - Track monthly income and savings with rollover functionality
- **Category Management** - Organize expenses with custom categories and icons
- **Calendar View** - Interactive calendar showing daily expenses with expandable date details
- **Analytics Dashboard** - Comprehensive charts and insights for spending patterns

### Dashboard Features
- **Multi-tab Interface** - Overview, Calendar, Analytics, and Categories tabs
- **Real-time Updates** - Live data synchronization across all components
- **Responsive Design** - Optimized for desktop and mobile devices
- **Dark Theme** - Modern dark UI with smooth animations

### Advanced Features
- **Budget Alerts** - Visual indicators for budget utilization
- **Expense Analytics** - Monthly spending trends and category breakdowns
- **Data Export** - Export functionality for financial records
- **Database Cleanup** - Built-in tools for data management

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - Component-based UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library
- **Recharts** - Data visualization library
- **GSAP** - Animation library
- **Sonner** - Toast notifications

### Backend & Database
- **PostgreSQL** - Primary database (Neon serverless)
- **Drizzle ORM** - Type-safe database toolkit
- **Clerk** - Authentication and user management

### Development Tools
- **Drizzle Kit** - Database migrations and studio
- **PostCSS** - CSS processing
- **ESLint** - Code linting

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)
- Clerk account for authentication

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense_track
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Configure Environment Variables**
   
   Edit `.env.local` with your actual credentials:
   ```env
   # Clerk Authentication Keys
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
   CLERK_SECRET_KEY=sk_test_your_secret_here
   
   # Clerk URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
   
   # Database
   DATABASE_URL=your_postgresql_connection_string
   ```

5. **Database Setup**
   ```bash
   # Push schema to database
   npm run db:push
   
   # Optional: Open Drizzle Studio
   npm run db:studio
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Setup

### Development Environment
The application uses Clerk for authentication. For development:

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your development keys (pk_test_* and sk_test_*)
4. Add them to your `.env.local` file

The development key warning is normal and expected during local development.

### Production Deployment
For production deployment:

1. Create a production instance in Clerk Dashboard
2. Update environment variables with production keys (pk_live_* and sk_live_*)
3. Configure your domain in Clerk Dashboard
4. Deploy to your hosting platform

Refer to `CLERK_SETUP.md` and `PRODUCTION_DEPLOYMENT.md` for detailed instructions.

## Database Schema

### Core Tables
- **budgets** - Budget definitions with amounts and categories
- **expenses** - Individual expense records linked to budgets
- **categories** - Custom expense categories with icons and colors
- **income** - Monthly income tracking
- **savings** - Savings goals and rollover amounts

### Key Relationships
- Expenses are linked to budgets via `budgetId`
- All records are user-scoped via `createdBy` field
- Income and savings are tracked monthly

## Usage Guide

### Getting Started
1. **Sign up/Sign in** using the authentication pages
2. **Set monthly income** in the Income & Savings tracker
3. **Create budgets** for different spending categories
4. **Add expenses** to track your spending
5. **Monitor progress** through the dashboard analytics

### Budget Management
- Create budgets with custom names, amounts, and icons
- Track spending against budget limits
- View budget utilization in real-time
- Manage active vs. completed budgets

### Expense Tracking
- Add expenses with names, amounts, and optional notes
- Assign expenses to specific budgets
- View expenses in calendar format
- Track daily, monthly, and yearly spending

### Analytics & Insights
- View spending trends over time
- Analyze expenses by category
- Monitor budget performance
- Track income vs. expenses ratio

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema changes to database
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## Project Structure

```
expense_track/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   ├── (routes)/dashboard/       # Main dashboard
│   │   ├── _components/          # Dashboard components
│   │   ├── budget/               # Budget management
│   │   ├── expenses/             # Expense tracking
│   │   └── page.jsx              # Dashboard home
│   ├── _components/              # Shared components
│   ├── globals.css               # Global styles
│   └── layout.js                 # Root layout
├── components/ui/                # Reusable UI components
├── drizzle/                      # Database migrations
├── lib/                          # Utility functions
├── public/                       # Static assets
├── utils/                        # Database config and schema
├── .env.local.example            # Environment template
├── drizzle.config.js             # Database configuration
├── middleware.ts                 # Clerk middleware
└── package.json                  # Dependencies
```

## Key Features Documentation

### Calendar-Based Expense Tracking
- Interactive calendar with clickable dates
- Expandable date boxes showing detailed expenses
- Form-based expense entry with automatic date assignment
- Real-time calendar updates

### Income & Savings Management
- Monthly income tracking with historical data
- Savings goals with rollover functionality
- Visual progress indicators
- Budget vs. actual income analysis

### Category Management
- Custom expense categories with icons and colors
- Category-based expense filtering
- Visual category representation in charts

### Analytics Dashboard
- Monthly spending trends
- Budget utilization charts
- Category-wise expense breakdown
- Income vs. expense comparisons

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL in environment variables
   - Ensure database is accessible and running
   - Check network connectivity

2. **Authentication Issues**
   - Verify Clerk keys are correctly set
   - Check environment variable names match exactly
   - Ensure Clerk instance is properly configured

3. **Build Errors**
   - Clear `.next` folder and rebuild
   - Verify all dependencies are installed
   - Check for TypeScript/JavaScript syntax errors

### Development Tips
- Use `npm run db:studio` to inspect database contents
- Check browser console for client-side errors
- Monitor server logs for API issues
- Refer to documentation files for specific feature issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check existing documentation files
2. Review troubleshooting section
3. Create an issue with detailed description
4. Include error messages and environment details

## Acknowledgments

- Built with Next.js and React
- Authentication by Clerk
- Database powered by Neon PostgreSQL
- UI components styled with Tailwind CSS
- Charts and analytics by Recharts