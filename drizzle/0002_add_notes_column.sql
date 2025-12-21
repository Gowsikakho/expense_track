-- Migration to add notes column to expenses table
-- This migration adds the notes field for additional expense information

-- Add notes column to expenses table
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "notes" varchar;

-- Add comment explaining the new column
COMMENT ON COLUMN "expenses"."notes" IS 'Optional notes field for additional expense information';