-- Migration to fix schema inconsistencies
-- This migration addresses the logical errors in the database schema

-- 1. Fix budgets.amount data type from varchar to decimal
ALTER TABLE "budgets" ALTER COLUMN "amount" TYPE decimal(10,2) USING "amount"::decimal(10,2);

-- 2. Add createdAt timestamp column to budgets table
ALTER TABLE "budgets" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now();

-- 3. Fix expenses.amount data type to use decimal for consistency
ALTER TABLE "expenses" ALTER COLUMN "amount" TYPE decimal(10,2) USING "amount"::decimal(10,2);

-- 4. Replace expenses.createdAt varchar with timestamp
ALTER TABLE "expenses" DROP COLUMN IF EXISTS "createdAt";
ALTER TABLE "expenses" ADD COLUMN "createdAt" timestamp DEFAULT now();

-- 5. Add createdAt timestamp column to categories table
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now();

-- Update existing records to have current timestamp for createdAt where NULL
UPDATE "budgets" SET "createdAt" = now() WHERE "createdAt" IS NULL;
UPDATE "expenses" SET "createdAt" = now() WHERE "createdAt" IS NULL;
UPDATE "categories" SET "createdAt" = now() WHERE "createdAt" IS NULL;

-- Add comments explaining the schema
COMMENT ON TABLE "budgets" IS 'Budget management table with financial amounts';
COMMENT ON TABLE "expenses" IS 'Expense tracking table linked to budgets and categories';
COMMENT ON TABLE "categories" IS 'Category classification for expenses';

COMMENT ON COLUMN "budgets"."amount" IS 'Budget amount as decimal for proper financial calculations';
COMMENT ON COLUMN "expenses"."amount" IS 'Expense amount as decimal for proper financial calculations';
COMMENT ON COLUMN "expenses"."date" IS 'Date when the expense occurred';
COMMENT ON COLUMN "expenses"."createdAt" IS 'Timestamp when the expense record was created';
