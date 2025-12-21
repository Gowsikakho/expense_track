'use client'
import React from 'react'
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const BarChartDashboard = ({ budgetList }) => {
    // Filter to only show active budgets (where remaining > 0)
    const activeBudgets = budgetList.filter(budget => (budget.amount - (budget.totalSpend || 0)) > 0);
    
    return (
        <div className="border bg-black rounded-lg p-5 flex flex-col justify-start">
            <h2 className="font-bold text-lg">Your Activity</h2>
            <ResponsiveContainer
                width="100%"
                height={300}
            >
                <BarChart
                    data={activeBudgets}
                    margin={{
                        top: 20,
                        // right: 10,
                        // left: 10,
                        // bottom: 10
                    }}
                >
                    <XAxis
                        className='text-xs md:text-sm lg:text-[16px] font-semibold mt-2'
                        dataKey="name"
                    />
                    <YAxis 
                        type="number"
                        domain={[0, 'dataMax']}
                        allowDecimals={false}
                        axisLine={true}
                        tickLine={true}
                        orientation="left"
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                        dataKey="totalSpend"
                        stackId="a"
                        fill="#4845d2"
                    />
                    <Bar
                        dataKey="amount"
                        stackId="a"
                        fill="#C3C2FF"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default BarChartDashboard
