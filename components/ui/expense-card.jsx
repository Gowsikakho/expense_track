'use client'
import React from 'react'
import { FaRupeeSign } from 'react-icons/fa'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const ExpenseCard = ({ expense, onDelete, isDeleting }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-base mb-1">
            {expense.name}
          </div>
          <div className="text-sm text-gray-600 flex items-center">
            <FaRupeeSign className="inline text-xs mr-1" />
            {Number(expense.amount).toLocaleString()}
          </div>
          {expense.notes && (
            <div className="text-xs text-gray-500 mt-2 italic">
              {expense.notes}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(expense.id)}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default ExpenseCard
