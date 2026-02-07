'use client'
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { db } from '@/utils/dbConfig'
import { Expenses } from '@/utils/schema'
import { and, gte, lte, sql } from 'drizzle-orm'
import moment from 'moment'
import { FaRupeeSign } from 'react-icons/fa'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ExpenseAnalytics = memo(({ user }) => {
    const [categoryData, setCategoryData] = useState([])
    const [timelineData, setTimelineData] = useState([])
    const [selectedMonth, setSelectedMonth] = useState(() => new Date())
    const [totalExpenses, setTotalExpenses] = useState(0)

    useEffect(() => {
        if (user) {
            fetchAnalyticsData()
        }
    }, [user, selectedMonth])

    const fetchAnalyticsData = async () => {
        const startOfMonth = moment(selectedMonth).startOf('month').format('YYYY-MM-DD')
        const endOfMonth = moment(selectedMonth).endOf('month').format('YYYY-MM-DD')

        try {
            // Temporarily disable category-based analytics since categoryId doesn't exist yet
            // TODO: Re-enable after database migration adds categoryId column

            // For now, just show a placeholder for category data
            const pieData = []
            setCategoryData(pieData)

            // Calculate total expenses from daily data
            let totalExpensesAmount = 0

            // Fetch daily expenses for timeline
            const dailyExpenses = await db.select({
                date: Expenses.date,
                total: sql`SUM(CAST(${Expenses.amount} AS NUMERIC))`.mapWith(Number)
            })
                .from(Expenses)
                .where(
                    and(
                        gte(Expenses.date, startOfMonth),
                        lte(Expenses.date, endOfMonth)
                    )
                )
                .groupBy(Expenses.date)
                .orderBy(Expenses.date)

            // Process timeline data
            const daysInMonth = moment(selectedMonth).daysInMonth()
            const timelineArray = []

            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = moment(selectedMonth).date(day).format('YYYY-MM-DD')
                const dayData = dailyExpenses.find(item => item.date === dateStr)

                timelineArray.push({
                    day: day,
                    date: dateStr,
                    amount: dayData ? dayData.total : 0
                })
            }

            setTimelineData(timelineArray)

            // Calculate total expenses from timeline data
            totalExpensesAmount = timelineArray.reduce((sum, day) => sum + day.amount, 0)
            setTotalExpenses(totalExpensesAmount)
        } catch (error) {
            console.error('Error fetching analytics data:', error)
        }
    }

    const navigateMonth = useCallback((direction) => {
        const newDate = new Date(selectedMonth)
        newDate.setMonth(selectedMonth.getMonth() + direction)
        setSelectedMonth(newDate)
    }, [selectedMonth])

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black border border-gray-600 p-3 rounded-lg">
                    <p className="text-white font-semibold">{`${payload[0].payload.icon} ${label}`}</p>
                    <p className="text-gray-300">
                        <FaRupeeSign className="inline text-sm" />
                        {payload[0].value}
                    </p>
                </div>
            )
        }
        return null
    }

    const BarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black border border-gray-600 p-3 rounded-lg">
                    <p className="text-white font-semibold">Day {label}</p>
                    <p className="text-gray-300">
                        <FaRupeeSign className="inline text-sm" />
                        {payload[0].value}
                    </p>
                </div>
            )
        }
        return null
    }

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null // Don't show label for small slices

        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-xs font-semibold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    return (
        <div className="space-y-5">
            {/* Month Navigation */}
            <div className="flex justify-between items-center">
                <h2 className="font-bold text-xl">Expense Analytics</h2>
                <div className="flex gap-2 items-center">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth(-1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center px-3 min-w-[140px] justify-center">
                        <span className="font-semibold">
                            {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Category Distribution - Pie Chart */}
                <div className="border bg-black rounded-lg p-5">
                    <h3 className="font-semibold text-lg mb-4">Category Distribution</h3>
                    {categoryData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={renderCustomLabel}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Category Legend */}
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {categoryData.map((category, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        <span className="text-gray-400">
                                            {category.icon} {category.name}
                                        </span>
                                        <span className="ml-auto font-semibold">
                                            <FaRupeeSign className="inline text-xs" />
                                            {category.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No expenses found for this month
                        </div>
                    )}
                </div>

                {/* Daily Expense Timeline - Bar Chart */}
                <div className="border bg-black rounded-lg p-5">
                    <h3 className="font-semibold text-lg mb-4">Daily Expense Timeline</h3>
                    <div className="mb-2 text-sm text-gray-400">
                        Total: <span className="font-semibold text-white">
                            <FaRupeeSign className="inline text-sm" />{totalExpenses}
                        </span>
                    </div>
                    {timelineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="day"
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    type="number"
                                    domain={[0, 'dataMax']}
                                    allowDecimals={false}
                                    stroke="#9CA3AF"
                                    tick={{ fontSize: 12 }}
                                    axisLine={true}
                                    tickLine={true}
                                    orientation="left"
                                />
                                <Tooltip content={<BarTooltip />} />
                                <Bar
                                    dataKey="amount"
                                    fill="#4845d2"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">
                            No expense data available
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-black">
                    <h4 className="text-sm text-gray-400 mb-2">Highest Spending Category</h4>
                    <div className="font-semibold">
                        {categoryData.length > 0 ? (
                            <>
                                <span className="text-lg mr-2">{categoryData[0]?.icon}</span>
                                {categoryData[0]?.name}
                            </>
                        ) : (
                            <span className="text-gray-500">No data</span>
                        )}
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-black">
                    <h4 className="text-sm text-gray-400 mb-2">Average Daily Expense</h4>
                    <div className="font-semibold">
                        <FaRupeeSign className="inline" />
                        {timelineData.length > 0
                            ? Math.round(totalExpenses / moment(selectedMonth).daysInMonth())
                            : 0
                        }
                    </div>
                </div>

                <div className="p-4 border rounded-lg bg-black">
                    <h4 className="text-sm text-gray-400 mb-2">Days with Expenses</h4>
                    <div className="font-semibold">
                        {timelineData.filter(day => day.amount > 0).length} / {moment(selectedMonth).daysInMonth()} days
                    </div>
                </div>
            </div>
        </div>
    )
})

ExpenseAnalytics.displayName = 'ExpenseAnalytics'

export default ExpenseAnalytics
