'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { db } from '@/utils/dbConfig'
import { Budgets, Expenses } from '@/utils/schema'
import { toast } from 'sonner'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from 'lucide-react'

const DatabaseCleaner = ({ onComplete }) => {
    const [isClearing, setIsClearing] = useState(false)

    const clearAllData = async () => {
        setIsClearing(true)
        try {
            console.log('🗑️  Starting database cleanup...')
            
            // First, delete all expenses (to avoid foreign key constraints)
            let expensesDeleted = []
            try {
                expensesDeleted = await db.delete(Expenses).returning()
                console.log(`✅ Deleted ${expensesDeleted.length} expenses`)
            } catch (expenseError) {
                console.error('Error deleting expenses:', expenseError)
                // Try alternative approach without returning
                await db.delete(Expenses)
                console.log('✅ Deleted expenses (without count)')
            }
            
            // Then, delete all budgets
            let budgetsDeleted = []
            try {
                budgetsDeleted = await db.delete(Budgets).returning()
                console.log(`✅ Deleted ${budgetsDeleted.length} budgets`)
            } catch (budgetError) {
                console.error('Error deleting budgets:', budgetError)
                // Try alternative approach without returning
                await db.delete(Budgets)
                console.log('✅ Deleted budgets (without count)')
            }
            
            const expenseCount = expensesDeleted.length || 'all'
            const budgetCount = budgetsDeleted.length || 'all'
            
            toast.success(`Database cleared! Removed ${budgetCount} budgets and ${expenseCount} expenses`, {
                duration: 5000
            })
            
            // Refresh the parent component
            if (onComplete) {
                onComplete()
            }
            
        } catch (error) {
            console.error('❌ Error during cleanup:', error)
            toast.error(`Failed to clear database: ${error.message || 'Unknown error'}. Please try again.`)
        } finally {
            setIsClearing(false)
        }
    }

    return (
        <div className="p-4 border border-red-500 rounded-lg bg-red-950/20">
            <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ Database Cleanup</h3>
            <p className="text-sm text-gray-400 mb-4">
                Remove all existing budgets and expenses to start fresh. This action cannot be undone.
            </p>
            
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button 
                        variant="destructive" 
                        disabled={isClearing}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {isClearing ? 'Clearing...' : 'Clear All Data'}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black text-white border border-red-500">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-400">⚠️ Clear All Database Data?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                            This will permanently delete ALL budgets and expenses from your database. 
                            This action cannot be undone.
                            <br /><br />
                            <strong>Are you absolutely sure you want to proceed?</strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={clearAllData}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isClearing}
                        >
                            {isClearing ? 'Clearing...' : 'Yes, Clear Everything'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default DatabaseCleaner
