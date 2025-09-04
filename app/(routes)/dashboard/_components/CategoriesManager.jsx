'use client'
import React, { useState, useEffect } from 'react'
import { db } from '@/utils/dbConfig'
import { Expenses } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { FaRupeeSign } from 'react-icons/fa'

const CategoriesManager = ({ user }) => {
    const [categoryData, setCategoryData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            fetchCategoryAnalysis()
        }
    }, [user])

    const fetchCategoryAnalysis = async () => {
        try {
            setLoading(true)
            
            // Fetch all personal expenses (not budget-related) for the user
            const result = await db.select({
                name: Expenses.name,
                amount: Expenses.amount,
                date: Expenses.date
            })
            .from(Expenses)
            .where(eq(Expenses.budgetId, null)) // Only personal expenses, not budget-related

            // Group expenses by category name and calculate totals
            const categoryGroups = result.reduce((acc, expense) => {
                const categoryName = expense.name || 'Uncategorized'
                
                if (!acc[categoryName]) {
                    acc[categoryName] = {
                        name: categoryName,
                        totalAmount: 0,
                        expenseCount: 0,
                        expenses: []
                    }
                }
                
                acc[categoryName].totalAmount += Number(expense.amount) || 0
                acc[categoryName].expenseCount += 1
                acc[categoryName].expenses.push(expense)
                
                return acc
            }, {})

            // Convert to array and sort by total amount (descending)
            const sortedCategories = Object.values(categoryGroups)
                .sort((a, b) => b.totalAmount - a.totalAmount)

            setCategoryData(sortedCategories)
        } catch (error) {
            console.error('Error fetching category analysis:', error)
        } finally {
            setLoading(false)
        }
    }

    const getCategoryIcon = (categoryName) => {
        // Simple icon mapping based on category name
        const iconMap = {
            'Food': '🍔',
            'Groceries': '🛒',
            'Transportation': '🚗',
            'Fuel': '⛽',
            'Gasoline': '⛽',
            'Healthcare': '🏥',
            'Medical': '💊',
            'Entertainment': '🎮',
            'Shopping': '🛍️',
            'Bills': '💡',
            'Utilities': '⚡',
            'Rent': '🏠',
            'Housing': '🏠',
            'Education': '📚',
            'Books': '📖',
            'Gym': '💪',
            'Fitness': '🏃',
            'Travel': '✈️',
            'Dining': '🍽️',
            'Restaurant': '🍴',
            'Coffee': '☕',
            'Clothing': '👕',
            'Electronics': '📱',
            'Home': '🏡',
            'Furniture': '🪑',
            'Maintenance': '🔧',
            'Insurance': '🛡️',
            'Taxes': '💰',
            'Investment': '📈',
            'Savings': '💎'
        }

        // Find the best matching icon
        for (const [key, icon] of Object.entries(iconMap)) {
            if (categoryName.toLowerCase().includes(key.toLowerCase())) {
                return icon
            }
        }
        
        return '📁' // Default icon
    }

    const getCategoryColor = (index) => {
        const colors = [
            '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
            '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
        ]
        return colors[index % colors.length]
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <h3 className="font-bold text-lg">Expense Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-24 bg-gray-800 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Expense Categories</h3>
                <p className="text-gray-400 text-sm">
                    Categories automatically generated from your personal expense data
                </p>
            </div>

            {categoryData.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h4 className="text-xl font-semibold mb-2">No Personal Expenses Found</h4>
                    <p className="text-gray-400">
                        Start adding personal expenses to see automatic category analysis
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {categoryData.map((category, index) => (
                        <div
                            key={category.name}
                            className="p-4 border rounded-lg bg-black hover:bg-gray-900 transition-colors"
                            style={{ borderColor: getCategoryColor(index) }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getCategoryIcon(category.name)}</span>
                                    <div>
                                        <div className="font-semibold">{category.name}</div>
                                        <div className="text-sm text-gray-400">
                                            {category.expenseCount} expense{category.expenseCount > 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-bold text-red-400">
                                        <FaRupeeSign className="inline text-sm mr-1" />
                                        {category.totalAmount.toLocaleString()}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {((category.totalAmount / categoryData.reduce((sum, cat) => sum + cat.totalAmount, 0)) * 100).toFixed(1)}% of total
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {categoryData.length > 0 && (
                <div className="mt-6 p-4 border rounded-lg bg-gray-900">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400 mb-2">
                            <FaRupeeSign className="inline text-sm mr-1" />
                            {categoryData.reduce((sum, cat) => sum + cat.totalAmount, 0).toLocaleString()}
                        </div>
                        <div className="text-gray-400">
                            Total personal expenses across {categoryData.length} categories
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CategoriesManager
