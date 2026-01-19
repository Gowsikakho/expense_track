'use client'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/utils/dbConfig'
import { Income, Savings, Expenses } from '@/utils/schema'
import { eq, and, gte, lte, desc } from 'drizzle-orm'
import { toast } from 'sonner'
import { FaRupeeSign } from 'react-icons/fa'
import { Wallet, PiggyBank, TrendingUp, TrendingDown, Edit } from 'lucide-react'
import moment from 'moment'

const IncomeSavingsTracker = ({ user, refreshData }) => {
    const [currentMonthIncome, setCurrentMonthIncome] = useState(0)
    const [totalSavings, setTotalSavings] = useState(0)
    const [monthlyExpenses, setMonthlyExpenses] = useState(0)
    const [isIncomeDialogOpen, setIsIncomeDialogOpen] = useState(false)
    const [incomeAmount, setIncomeAmount] = useState('')
    const [savingsHistory, setSavingsHistory] = useState([])
    const currentMonth = moment().format('YYYY-MM')

    useEffect(() => {
        if (user) {
            fetchIncomeAndSavings()
            fetchMonthlyExpenses()
        }
    }, [user])

    const fetchIncomeAndSavings = async () => {
        try {
            // Fetch current month income
            const incomeResult = await db.select({
                id: Income.id,
                amount: Income.amount,
                month: Income.month,
                createdBy: Income.createdBy
            })
                .from(Income)
                .where(
                    and(
                        eq(Income.createdBy, user.email),
                        eq(Income.month, currentMonth)
                    )
                )
                .limit(1)

            if (incomeResult.length > 0) {
                setCurrentMonthIncome(Number(incomeResult[0].amount))
            }

            // Fetch all savings
            const savingsResult = await db.select({
                id: Savings.id,
                amount: Savings.amount,
                month: Savings.month,
                isRollover: Savings.isRollover,
                createdBy: Savings.createdBy
            })
                .from(Savings)
                .where(eq(Savings.createdBy, user.email))
                .orderBy(desc(Savings.id))

            const total = savingsResult.reduce((sum, saving) => sum + Number(saving.amount), 0)
            setTotalSavings(total)
            setSavingsHistory(savingsResult.slice(0, 5)) // Show last 5 transactions
        } catch (error) {
            console.error('Error fetching income and savings:', error)
        }
    }

    const fetchMonthlyExpenses = async () => {
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD')
        const endOfMonth = moment().endOf('month').format('YYYY-MM-DD')

        try {
            const result = await db.select({
                amount: Expenses.amount
            })
                .from(Expenses)
                .where(
                    and(
                        gte(Expenses.date, startOfMonth),
                        lte(Expenses.date, endOfMonth)
                    )
                )

            const total = result.reduce((sum, expense) => sum + Number(expense.amount), 0)
            setMonthlyExpenses(total)
        } catch (error) {
            console.error('Error fetching expenses:', error)
        }
    }

    const handleSetIncome = async () => {
        if (!incomeAmount || incomeAmount <= 0) {
            toast.error('Please enter a valid income amount')
            return
        }

        if (!user?.email) {
            toast.error('User not authenticated')
            return
        }

        try {
            // Check if income already exists for this month
            const existingIncome = await db.select({
                id: Income.id,
                amount: Income.amount
            })
                .from(Income)
                .where(
                    and(
                        eq(Income.createdBy, user.email),
                        eq(Income.month, currentMonth)
                    )
                )

            if (existingIncome.length > 0) {
                // Update existing income
                await db.update(Income)
                    .set({ amount: incomeAmount })
                    .where(eq(Income.id, existingIncome[0].id))
            } else {
                // Insert new income
                await db.insert(Income).values({
                    amount: incomeAmount,
                    month: currentMonth,
                    createdBy: user.email
                })
            }

            toast.success('Income updated successfully!')
            setIncomeAmount('')
            setIsIncomeDialogOpen(false)
            fetchIncomeAndSavings()
            refreshData()
        } catch (error) {
            console.error('Error setting income:', error)
            toast.error('Failed to update income')
        }
    }

    const processMonthEnd = async () => {
        const remaining = currentMonthIncome - monthlyExpenses

        if (remaining !== 0) {
            try {
                // Add to savings (positive if surplus, negative if deficit)
                await db.insert(Savings).values({
                    amount: remaining.toString(),
                    month: currentMonth,
                    isRollover: true,
                    createdBy: user.email
                })

                if (remaining > 0) {
                    toast.success(`₹${remaining} added to savings!`)
                } else {
                    toast.warning(`₹${Math.abs(remaining)} deducted from savings to cover deficit`)
                }

                fetchIncomeAndSavings()
                refreshData()
            } catch (error) {
                console.error('Error processing month end:', error)
                toast.error('Failed to process month end')
            }
        }
    }

    const monthlyBalance = currentMonthIncome - monthlyExpenses

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Monthly Income Card */}
            <div className="p-6 border rounded-lg bg-black">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-sm text-gray-400">Monthly Income</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <FaRupeeSign className="text-xl" />
                            <h2 className="font-bold text-2xl">{currentMonthIncome}</h2>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsIncomeDialogOpen(true)}
                        className="h-8 w-8"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mt-4">
                    <div className="text-sm text-gray-400">Balance</div>
                    <div className={`flex items-center gap-1 font-semibold ${monthlyBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {monthlyBalance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <FaRupeeSign className="text-sm" />
                        {Math.abs(monthlyBalance)}
                    </div>
                </div>
            </div>

            {/* Total Savings Card */}
            <div className="p-6 border rounded-lg bg-black">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-sm text-gray-400">Total Savings</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <FaRupeeSign className="text-xl" />
                            <h2 className="font-bold text-2xl">{totalSavings}</h2>
                        </div>
                    </div>
                    <PiggyBank className="h-8 w-8 text-primary" />
                </div>
                <div className="mt-4 text-sm text-gray-400">
                    Available for emergency use
                </div>
            </div>

            {/* Recent Savings Activity */}
            <div className="p-6 border rounded-lg bg-black">
                <h3 className="text-sm text-gray-400 mb-3">Recent Savings Activity</h3>
                <div className="space-y-2 max-h-[120px] overflow-y-auto">
                    {savingsHistory.length > 0 ? (
                        savingsHistory.map((saving, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">
                                    {moment(saving.month, 'YYYY-MM').format('MMM YYYY')}
                                </span>
                                <span className={`font-semibold ${Number(saving.amount) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {Number(saving.amount) >= 0 ? '+' : ''}<FaRupeeSign className="inline text-xs" />{saving.amount}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-sm">No savings history yet</div>
                    )}
                </div>
            </div>

            {/* Income Dialog */}
            <Dialog open={isIncomeDialogOpen} onOpenChange={setIsIncomeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set Monthly Income</DialogTitle>
                        <DialogDescription>
                            Enter your income for {moment().format('MMMM YYYY')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="income">Income Amount</label>
                            <Input
                                id="income"
                                type="number"
                                placeholder="0"
                                value={incomeAmount}
                                onChange={(e) => setIncomeAmount(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSetIncome}>Save Income</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default IncomeSavingsTracker
