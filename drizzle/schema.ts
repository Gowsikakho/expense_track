import { pgTable, serial, varchar, numeric, timestamp, boolean, foreignKey, integer } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"



export const budgets = pgTable("budgets", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name").notNull(),
	amount: varchar("amount").notNull(),
	icon: varchar("icon"),
	createdBy: varchar("createdBy").notNull(),
});

export const categories = pgTable("categories", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name").notNull(),
	icon: varchar("icon"),
	color: varchar("color"),
	createdBy: varchar("createdBy").notNull(),
});

export const income = pgTable("income", {
	id: serial("id").primaryKey().notNull(),
	amount: numeric("amount", { precision: 10, scale:  2 }).notNull(),
	month: varchar("month").notNull(),
	createdBy: varchar("createdBy").notNull(),
	createdAt: timestamp("createdAt", { mode: 'string' }).defaultNow(),
});

export const savings = pgTable("savings", {
	id: serial("id").primaryKey().notNull(),
	amount: numeric("amount", { precision: 10, scale:  2 }).default('0').notNull(),
	month: varchar("month").notNull(),
	isRollover: boolean("isRollover").default(false),
	createdBy: varchar("createdBy").notNull(),
	createdAt: timestamp("createdAt", { mode: 'string' }).defaultNow(),
});

export const expenses = pgTable("expenses", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name").notNull(),
	amount: varchar("amount").default(0).notNull(),
	budgetId: integer("budgetId").references(() => budgets.id),
	createdAt: varchar("createdAt").notNull(),
	date: varchar("date").notNull(),
	notes: varchar("notes"),
});