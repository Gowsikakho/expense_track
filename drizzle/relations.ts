import { relations } from "drizzle-orm/relations";
import { budgets, expenses } from "./schema";

export const expensesRelations = relations(expenses, ({one}) => ({
	budget: one(budgets, {
		fields: [expenses.budgetId],
		references: [budgets.id]
	}),
}));

export const budgetsRelations = relations(budgets, ({many}) => ({
	expenses: many(expenses),
}));