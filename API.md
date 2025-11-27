# API Documentation

## Database Schema

### Budgets Table
- id: serial primary key
- name: varchar
- amount: varchar
- icon: varchar
- createdBy: varchar

### Expenses Table
- id: serial primary key
- name: varchar
- amount: numeric
- budgetId: integer (foreign key)
- createdAt: varchar

## API Endpoints
All database operations are performed server-side using Drizzle ORM.
