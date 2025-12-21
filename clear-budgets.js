// Clear all budgets and expenses - Run this once to clean your database
// WARNING: This will delete ALL data in budgets and expenses tables

import { db } from './utils/dbConfig.js'
import { Budgets, Expenses } from './utils/schema.jsx'

async function clearAllBudgets() {
    try {
        console.log('🗑️  Starting database cleanup...')
        
        // First, delete all expenses (to avoid foreign key constraints)
        const expensesDeleted = await db.delete(Expenses).returning()
        console.log(`✅ Deleted ${expensesDeleted.length} expenses`)
        
        // Then, delete all budgets
        const budgetsDeleted = await db.delete(Budgets).returning()
        console.log(`✅ Deleted ${budgetsDeleted.length} budgets`)
        
        console.log('🎉 Database cleanup completed successfully!')
        console.log('📝 Your database is now clean and ready for user-created budgets only.')
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error)
    } finally {
        process.exit(0)
    }
}

clearAllBudgets()
