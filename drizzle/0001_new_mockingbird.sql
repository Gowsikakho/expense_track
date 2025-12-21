ALTER TABLE "expenses" DROP CONSTRAINT "expenses_categoryId_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "amount" SET DEFAULT '0';--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "notes" varchar;--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN IF EXISTS "categoryId";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN IF EXISTS "createdBy";