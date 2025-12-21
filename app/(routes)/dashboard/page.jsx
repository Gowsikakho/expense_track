"use client"
import { UserButton, useUser } from '@clerk/nextjs'
import React, { useEffect, useState } from 'react'
import CardInfo from './_components/CardInfo';
import { desc, eq, getTableColumns, sql, and, gte, lte } from 'drizzle-orm';
import { Budgets, Expenses, Categories, Income } from '@/utils/schema';
import { db } from '@/utils/dbConfig';
import BarChartDashboard from './_components/BarChartDashboard';
import BudgetItem from './budget/_components/BudgetItem';
import ExpenseListTable from './expenses/_components/ExpenseListTable';
import ExpenseCalendar from './_components/ExpenseCalendar';
import IncomeSavingsTracker from './_components/IncomeSavingsTracker';
import CategoriesManager from './_components/CategoriesManager';
import ExpenseAnalytics from './_components/ExpenseAnalytics';
import moment from 'moment';

const page = () => {

    const { user } = useUser();

    const [budgetList, setBudgetList] = useState([]);
    const [expensesList, setExpensesList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (user) {
            getBudgetList();
            fetchCategories();
            fetchMonthlyIncome();
        }
    }, [user]);

    const getBudgetList = async () => {
        const result = await db.select({
            id: Budgets.id,
            name: Budgets.name,
            amount: Budgets.amount,
            icon: Budgets.icon,
            createdBy: Budgets.createdBy,
            totalSpend: sql`SUM(CAST(${Expenses.amount} AS NUMERIC))`.mapWith(Number),
            totalItem: sql`count(${Expenses.id})`.mapWith(Number),
        }).from(Budgets)
            .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user.primaryEmailAddress?.emailAddress))
            .groupBy(Budgets.id)
            .orderBy(desc(Budgets.id));

        setBudgetList(result);
        getAllExpenses();
    }

    const getAllExpenses = async () => {
        const result = await db.select({
            id: Expenses.id,
            name: Expenses.name,
            amount: Expenses.amount,
            date: Expenses.date
        }).from(Expenses)
            .orderBy(desc(Expenses.id))
            .limit(10);

        setExpensesList(result);
    }

    const fetchCategories = async () => {
        try {
            const result = await db.select({
                id: Categories.id,
                name: Categories.name,
                icon: Categories.icon,
                color: Categories.color,
                createdBy: Categories.createdBy
            })
                .from(Categories)
                .where(eq(Categories.createdBy, user.primaryEmailAddress?.emailAddress));
            setCategories(result);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    const fetchMonthlyIncome = async () => {
        try {
            const currentMonth = moment().format('YYYY-MM');
            const result = await db.select({
                id: Income.id,
                amount: Income.amount,
                month: Income.month,
                createdBy: Income.createdBy
            })
                .from(Income)
                .where(
                    and(
                        eq(Income.createdBy, user.primaryEmailAddress?.emailAddress),
                        eq(Income.month, currentMonth)
                    )
                )
                .limit(1);
            
            if (result.length > 0) {
                setMonthlyIncome(Number(result[0].amount));
            }
        } catch (error) {
            console.error('Error fetching income:', error);
        }
    }

    // useEffect(() => {
    //     console.log(expensesList);
    // }, [expensesList])

    return (
        <div className="mt-16 md:mt-0 text-white p-8">
            {user ?
                <div>
                    <h2 className="font-bold text-3xl">Hi, {user?.fullName}</h2>
                    <p className="text-gray-500">Here's what happening with your money, let's manage your expenses</p>
                </div> :
                <div>
                    <h2 className="w-[160px] p-2 h-[30px] rounded-lg bg-slate-800 animate-pulse"></h2>
                    <p className="w-[260px] mt-3 h-[20px] rounded-lg bg-slate-800 animate-pulse"></p>
                </div>
            }
            
            {/* Tab Navigation */}
            <div className="flex gap-4 mt-8 mb-6 border-b border-gray-700">
                <button
                    className={`pb-2 px-1 font-semibold transition-colors ${
                        activeTab === 'overview' 
                            ? 'text-primary border-b-2 border-primary' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`pb-2 px-1 font-semibold transition-colors ${
                        activeTab === 'calendar' 
                            ? 'text-primary border-b-2 border-primary' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('calendar')}
                >
                    Calendar
                </button>
                <button
                    className={`pb-2 px-1 font-semibold transition-colors ${
                        activeTab === 'analytics' 
                            ? 'text-primary border-b-2 border-primary' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('analytics')}
                >
                    Analytics
                </button>
                <button
                    className={`pb-2 px-1 font-semibold transition-colors ${
                        activeTab === 'categories' 
                            ? 'text-primary border-b-2 border-primary' 
                            : 'text-gray-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('categories')}
                >
                    Categories
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <>
                    {/* Income and Savings Tracker */}
                    <IncomeSavingsTracker 
                        user={user} 
                        refreshData={() => {
                            getBudgetList();
                            fetchMonthlyIncome();
                        }} 
                    />
                    
                    <CardInfo
                        budgetList={budgetList}
                    />
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 mt-10 gap-5">
                        {user && (
                            <>
                                <div className="md:col-span-2 flex flex-col gap-4">
                                    <BarChartDashboard
                                        budgetList={budgetList}
                                    />
                                </div>
                                <div className="grid gap-3">
                                    <h2 className="font-bold text-lg">Active Budgets</h2>
                                    {budgetList.filter(budget => (budget.amount - (budget.totalSpend || 0)) > 0).length > 0 ? (
                                        budgetList
                                            .filter(budget => (budget.amount - (budget.totalSpend || 0)) > 0)
                                            .slice(0, 4)
                                            .map((budget, index) => (
                                                <BudgetItem
                                                    budget={budget}
                                                    key={index}
                                                />
                                            ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-400">
                                            <div className="text-4xl mb-2">💰</div>
                                            <p>No active budgets</p>
                                            <p className="text-sm">All budgets are fully used</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && user && (
                <ExpenseCalendar
                    user={user}
                    refreshData={() => {
                        getBudgetList();
                        getAllExpenses();
                    }}
                    categories={categories}
                    monthlyIncome={monthlyIncome}
                />
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && user && (
                <ExpenseAnalytics user={user} />
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && user && (
                <CategoriesManager 
                    user={user} 
                    refreshCategories={fetchCategories}
                />
            )}
        </div>
    )
}

export default page
