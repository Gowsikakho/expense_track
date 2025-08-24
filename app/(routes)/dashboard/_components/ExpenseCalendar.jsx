'use client'
import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/utils/dbConfig'
import { Expenses, Categories } from '@/utils/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { toast } from 'sonner'
import { FaRupeeSign } from 'react-icons/fa'
import moment from 'moment'

const ExpenseCalendar = ({ user, refreshData, categories, monthlyIncome }) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(null)
    const [monthExpenses, setMonthExpenses] = useState([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [expenseName, setExpenseName] = useState('')
    const [expenseAmount, setExpenseAmount] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [dailyExpenses, setDailyExpenses] = useState({})

    useEffect(() => {
        if (user) {
            fetchMonthExpenses()
        }
    }, [currentDate, user])

    const fetchMonthExpenses = async () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        const startDate = moment(startOfMonth).format('YYYY-MM-DD')
        const endDate = moment(endOfMonth).format('YYYY-MM-DD')

        try {
            const result = await db.select()
                .from(Expenses)
                .where(
                    and(
                        eq(Expenses.createdBy, user.primaryEmailAddress?.emailAddress),
                        gte(Expenses.date, startDate),
                        lte(Expenses.date, endDate)
                    )
                )

            setMonthExpenses(result)
            
            // Group expenses by date
            const grouped = result.reduce((acc, expense) => {
                const date = expense.date
                if (!acc[date]) {
                    acc[date] = []
                }
                acc[date].push(expense)
                return acc
            }, {})
            
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

    const handleDateClick = (day) => {
        if (day) {
            const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            setSelectedDate(clickedDate)
            setIsDialogOpen(true)
        }
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
        if (!expenseName || !expenseAmount || !selectedCategory) {
            toast.error('Please fill all fields')
            return
        }

        try {
            const result = await db.insert(Expenses).values({
                name: expenseName,
                amount: expenseAmount,
                categoryId: parseInt(selectedCategory),
                date: moment(selectedDate).format('YYYY-MM-DD'),
                createdAt: moment().format('DD/MM/YYYY'),
                createdBy: user.primaryEmailAddress?.emailAddress
            })

            if (result) {
                toast.success('Expense added successfully!')
                setExpenseName('')
                setExpenseAmount('')
                setSelectedCategory('')
                setIsDialogOpen(false)
                fetchMonthExpenses()
                refreshData()
            }
        } catch (error) {
            console.error('Error adding expense:', error)
            toast.error('Failed to add expense')
        }
    }

    const remainingBudget = monthlyIncome - getMonthTotal()

    return (
        <div className="border bg-black rounded-lg p-5">
            <div className="flex justify-between items-center mb-5">
                <h2 className="font-bold text-xl">Expense Calendar</h2>
                <div className="flex items-center gap-4">
                    <div className="text-sm">
                        <span className="text-gray-400">Remaining: </span>
                        <span className={`font-bold ${remainingBudget >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <FaRupeeSign className="inline text-sm" />
                            {Math.abs(remainingBudget)}
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
                                min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all
                                ${day ? 'hover:bg-gray-800' : ''}
                                ${isToday ? 'bg-primary/20 border-primary' : 'border-gray-700'}
                            `}
                            onClick={() => handleDateClick(day)}
                        >
                            {day && (
                                <>
                                    <div className="text-sm font-semibold mb-1">{day}</div>
                                    {dayTotal > 0 && (
                                        <div className="text-xs text-red-400">
                                            <FaRupeeSign className="inline text-xs" />
                                            {dayTotal}
                                        </div>
                                    )}
                                    {dayExpenses.length > 0 && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            {dayExpenses.length} expense{dayExpenses.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )
                })}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Expense for {selectedDate?.toLocaleDateString()}</DialogTitle>
                        <DialogDescription>
                            Add a new expense for this date
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="name">Expense Name</label>
                            <Input
                                id="name"
                                placeholder="e.g., Groceries, Fuel, etc."
                                value={expenseName}
                                onChange={(e) => setExpenseName(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="amount">Amount</label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="category">Category</label>
                            <select
                                id="category"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Select a category</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.icon} {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleAddExpense}>Add Expense</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default ExpenseCalendar
