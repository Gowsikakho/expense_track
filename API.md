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
