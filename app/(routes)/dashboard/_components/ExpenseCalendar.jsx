'use client'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Modal from '@/components/ui/modal'
import ExpenseCard from '@/components/ui/expense-card'
import { db } from '@/utils/dbConfig'
import { Expenses, Categories } from '@/utils/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { toast } from 'sonner'
import { FaRupeeSign } from 'react-icons/fa'
import moment from 'moment'

const ExpenseCalendar = ({ user, refreshData, categories, monthlyIncome }) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [monthExpenses, setMonthExpenses] = useState([])
    const [expenseName, setExpenseName] = useState('')
    const [expenseAmount, setExpenseAmount] = useState('')
    const [expenseNotes, setExpenseNotes] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [expenseDate, setExpenseDate] = useState(moment().format('YYYY-MM-DD'))
    const [dailyExpenses, setDailyExpenses] = useState({})
    const [isAddingExpense, setIsAddingExpense] = useState(false)
    const [isDeletingExpense, setIsDeletingExpense] = useState(false)

    useEffect(() => {
        if (user) {
            console.log('User found, fetching expenses...')
            fetchMonthExpenses()
        } else {
            console.log('No user found')
        }
    }, [currentDate, user])

    const fetchMonthExpenses = async () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        const startDate = moment(startOfMonth).format('YYYY-MM-DD')
        const endDate = moment(endOfMonth).format('YYYY-MM-DD')

        try {
            
            // First, let's try without any filters to see if we get any data
            const allExpenses = await db.select().from(Expenses)
            console.log('All expenses without filters:', allExpenses)
            
            // Debug: Check if any expenses have budgetId = null
            const personalExpenses = allExpenses.filter(expense => expense.budgetId === null)
            console.log('Personal expenses (budgetId = null):', personalExpenses)
            
            // Try without budgetId filter first
            const result = await db.select({
                id: Expenses.id,
                name: Expenses.name,
                amount: Expenses.amount,
                budgetId: Expenses.budgetId,
                date: Expenses.date,
                notes: Expenses.notes
            })
                .from(Expenses)
                .where(
                    and(
                        gte(Expenses.date, startDate),
                        lte(Expenses.date, endDate)
                        // Temporarily remove budgetId filter to test
                        // eq(Expenses.budgetId, null)
                    )
                )
            
            console.log('Filtered result:', result)

            setMonthExpenses(result)
            
            // Group expenses by date
            const grouped = result.reduce((acc, expense) => {
                const date = expense.date
                console.log('Processing expense:', expense.name, 'for date:', date)
                if (!acc[date]) {
                    acc[date] = []
                }
                acc[date].push(expense)
                return acc
            }, {})
            
            console.log('Final grouped expenses:', grouped)
            
            setDailyExpenses(grouped)
        } catch (error) {
            console.error('Error fetching expenses:', error)
        }
    }

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []
        
        // Add empty cells for days before the start of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }
        
        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i)
        }
        
        return days
    }

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate)
        newDate.setMonth(currentDate.getMonth() + direction)
        setCurrentDate(newDate)
    }

    const handleDateClick = async (day) => {
        if (day) {
            const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            setSelectedDate(clickedDate)
            setIsModalOpen(true)
            
            // Set the form date to the clicked date
            const clickedDateStr = moment(clickedDate).format('YYYY-MM-DD')
            setExpenseDate(clickedDateStr)
            
            // Refresh data to ensure we have the latest expenses
            await fetchMonthExpenses()
        }
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedDate(null)
    }

    const getDayExpenses = (day) => {
        if (!day) return []
        const dateStr = moment(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)).format('YYYY-MM-DD')
        return dailyExpenses[dateStr] || []
    }

    const getDayTotal = (day) => {
        const expenses = getDayExpenses(day)
        return expenses.reduce((total, expense) => total + Number(expense.amount), 0)
    }

    const getMonthTotal = () => {
        return monthExpenses.reduce((total, expense) => total + Number(expense.amount), 0)
    }

    const handleAddExpense = async () => {
        if (!expenseName || !expenseAmount || !expenseDate) {
            toast.error('Please fill expense name, amount, and date')
            return
        }

        setIsAddingExpense(true)

        try {
            console.log('Adding expense with data:', {
                name: expenseName,
                amount: expenseAmount,
                date: expenseDate,
                notes: expenseNotes,
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                budgetId: null
            })
            
            const result = await db.insert(Expenses).values({
                name: expenseName,
                amount: expenseAmount,
                date: expenseDate, // Use the selected date
                notes: expenseNotes || null,
                createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
                budgetId: null // Ensure this is a personal expense, not budget-related
            })
            
            if (result) {
                console.log('Expense added successfully:', result)
                toast.success('Personal expense added successfully!')
                setExpenseName('')
                setExpenseAmount('')
                setExpenseNotes('')
                setSelectedCategory('')
                setExpenseDate(moment().format('YYYY-MM-DD')) // Reset to today's date
                // Refresh data immediately
                console.log('Refreshing data after adding expense...')
                await fetchMonthExpenses()
                refreshData()
                // Force re-render to update remaining budget
                setMonthExpenses(prev => [...prev])
                console.log('Data refresh completed')
            }
        } catch (error) {
            console.error('Error adding expense:', error)
            toast.error('Failed to add expense')
        } finally {
            setIsAddingExpense(false)
        }
    }

    const getRemainingBudget = () => {
        return monthlyIncome - getMonthTotal()
    }

    const handleDeleteExpense = async (expenseId) => {
        if (!confirm('Are you sure you want to delete this expense?')) {
            return
        }

        setIsDeletingExpense(true)

        try {
            const result = await db.delete(Expenses).where(eq(Expenses.id, expenseId))
            
            if (result) {
                toast.success('Expense deleted successfully!')
                // Refresh data immediately
                await fetchMonthExpenses()
                refreshData()
                // Force re-render to update remaining budget
                setMonthExpenses(prev => [...prev])
            }
        } catch (error) {
            console.error('Error deleting expense:', error)
            toast.error('Failed to delete expense')
        } finally {
            setIsDeletingExpense(false)
        }
    }

    return (
        <div className="border bg-black rounded-lg p-5">
            <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-xl">Personal Expenses Calendar</h2>
                <div className="flex items-center gap-4">
                    <div className="text-sm">
                        <span className="text-gray-400">Remaining: </span>
                        <span className={`font-bold ${getRemainingBudget() >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <FaRupeeSign className="inline text-sm" />
                            {Math.abs(getRemainingBudget())}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => navigateMonth(-1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center px-3 min-w-[140px] justify-center">
                            <span className="font-semibold">
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                        <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => navigateMonth(1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Add Expense Form - Moved outside calendar */}
            <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-gray-900">
                <h3 className="font-semibold text-lg mb-4">Add New Expense</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Expense Name</label>
                        <Input
                            placeholder="e.g., Groceries, Fuel, etc."
                            value={expenseName}
                            onChange={(e) => setExpenseName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Amount</label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={expenseAmount}
                            onChange={(e) => setExpenseAmount(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <Input
                            type="date"
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Select a category</option>
                            <option value="Food">🍽️ Food</option>
                            <option value="Transport">🚗 Transport</option>
                            <option value="Entertainment">🎬 Entertainment</option>
                            <option value="Shopping">🛍️ Shopping</option>
                            <option value="Health">🏥 Health</option>
                            <option value="Utilities">⚡ Utilities</option>
                            <option value="Other">📝 Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                        <Input
                            placeholder="Additional notes..."
                            value={expenseNotes}
                            onChange={(e) => setExpenseNotes(e.target.value)}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <Button 
                        onClick={handleAddExpense}
                        disabled={!expenseName || !expenseAmount || !expenseDate || isAddingExpense}
                        className="w-full md:w-auto"
                    >
                        {isAddingExpense ? 'Adding...' : 'Add Expense'}
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                        {day}
                    </div>
                ))}
                
                {getDaysInMonth().map((day, index) => {
                    const dayExpenses = getDayExpenses(day)
                    const dayTotal = getDayTotal(day)
                    const isToday = day && 
                        new Date().getDate() === day && 
                        new Date().getMonth() === currentDate.getMonth() &&
                        new Date().getFullYear() === currentDate.getFullYear()
                    
                    return (
                        <div
                            key={index}
                            className={`
                                min-h-[80px] p-2 flex flex-col items-center justify-center 
                                rounded-lg cursor-pointer transition-all duration-200
                                ${day ? 'bg-gray-800 hover:bg-gray-700 hover:scale-105 active:scale-95' : ''}
                                ${isToday ? 'bg-blue-600 hover:bg-blue-500' : ''}
                                ${!day ? 'invisible' : ''}
                            `}
                            onClick={() => handleDateClick(day)}
                        >
                            {day && (
                                <>
                                    <div className="text-white font-semibold text-sm mb-1">{day}</div>
                                    {dayTotal > 0 && (
                                        <div className="text-xs text-green-400 font-medium">
                                            <FaRupeeSign className="inline text-xs" />
                                            {dayTotal}
                                        </div>
                                    )}
                                    {dayExpenses.length > 0 && (
                                        <div className="text-xs text-gray-300 mt-1">
                                            {dayExpenses.length} expense{dayExpenses.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Modal for displaying expenses */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={closeModal}
                title={selectedDate ? `Expenses for ${selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}` : ''}
                className="max-w-lg"
            >
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {selectedDate && (() => {
                        const dateStr = moment(selectedDate).format('YYYY-MM-DD')
                        const dayExpenses = dailyExpenses[dateStr] || []
                        
                        console.log('Modal - Selected date:', selectedDate)
                        console.log('Modal - Looking for date string:', dateStr)
                        console.log('Modal - Available dates in dailyExpenses:', Object.keys(dailyExpenses))
                        console.log('Modal - Found expenses for this date:', dayExpenses)
                        
                        
                        return dayExpenses.length > 0 ? (
                            <div className="space-y-3">
                                {dayExpenses.map((expense, idx) => (
                                    <ExpenseCard 
                                        key={idx} 
                                        expense={expense} 
                                        onDelete={handleDeleteExpense}
                                        isDeleting={isDeletingExpense}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-lg font-medium mb-2">No expenses on this date</div>
                                <div className="text-sm">Add an expense using the form above</div>
                            </div>
                        )
                    })()}
                </div>
            </Modal>

        </div>
    )
}

export default ExpenseCalendar
