"use client"
import React from 'react'
import BudgetList from './_components/BudgetList'
import DatabaseCleaner from '../_components/DatabaseCleaner'

const page = () => {
  return (
    <div className="mt-16 md:mt-0 p-10 bg-slate-900 overflow-y-hidden scrollbar-hide">
      <h2 className="font-bold text-3xl text-white animate-pulse">My Budgets</h2>
      
      {/* Temporary: Database cleanup tool - Remove after use */}
      <div className="mb-6">
        <DatabaseCleaner onComplete={() => window.location.reload()} />
      </div>
      
      <BudgetList />
    </div>
  )
}

export default page
