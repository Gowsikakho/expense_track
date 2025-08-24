import { integer, numeric, pgTable, serial, varchar, date, decimal, timestamp, boolean } from "drizzle-orm/pg-core";

export const Budgets = pgTable('budgets', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    amount: varchar('amount').notNull(),
    icon: varchar('icon'),
    createdBy: varchar('createdBy').notNull()
})

export const Expenses = pgTable('expenses', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    amount: numeric('amount').notNull().default(0),
    budgetId: integer('budgetId').references(() => Budgets.id),
    categoryId: integer('categoryId').references(() => Categories.id),
    date: date('date').notNull(),
    createdAt: varchar('createdAt').notNull(),
    createdBy: varchar('createdBy').notNull()
})

export const Categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    icon: varchar('icon'),
    color: varchar('color'),
    createdBy: varchar('createdBy').notNull()
})

export const Income = pgTable('income', {
    id: serial('id').primaryKey(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    month: varchar('month').notNull(), // Format: YYYY-MM
    createdBy: varchar('createdBy').notNull(),
    createdAt: timestamp('createdAt').defaultNow()
})

export const Savings = pgTable('savings', {
    id: serial('id').primaryKey(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull().default(0),
    month: varchar('month').notNull(), // Format: YYYY-MM
    isRollover: boolean('isRollover').default(false),
    createdBy: varchar('createdBy').notNull(),
    createdAt: timestamp('createdAt').defaultNow()
})
