'use client'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { db } from '@/utils/dbConfig'
import { Categories } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import EmojiPicker from 'emoji-picker-react'

const CategoriesManager = ({ user, refreshCategories }) => {
    const [categories, setCategories] = useState([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [categoryName, setCategoryName] = useState('')
    const [categoryIcon, setCategoryIcon] = useState('📁')
    const [categoryColor, setCategoryColor] = useState('#4845d2')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [editingCategory, setEditingCategory] = useState(null)

    const predefinedColors = [
        '#4845d2', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6',
        '#ec4899', '#06b6d4', '#10b981', '#f97316', '#3b82f6'
    ]

    useEffect(() => {
        if (user) {
            fetchCategories()
        }
    }, [user])

    const fetchCategories = async () => {
        try {
            const result = await db.select()
                .from(Categories)
                .where(eq(Categories.createdBy, user.primaryEmailAddress?.emailAddress))

            setCategories(result)
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const handleSaveCategory = async () => {
        if (!categoryName.trim()) {
            toast.error('Please enter a category name')
            return
        }

        try {
            if (editingCategory) {
                // Update existing category
                await db.update(Categories)
                    .set({
                        name: categoryName,
                        icon: categoryIcon,
                        color: categoryColor
                    })
                    .where(eq(Categories.id, editingCategory.id))

                toast.success('Category updated successfully!')
            } else {
                // Create new category
                await db.insert(Categories).values({
                    name: categoryName,
                    icon: categoryIcon,
                    color: categoryColor,
                    createdBy: user.primaryEmailAddress?.emailAddress
                })

                toast.success('Category created successfully!')
            }

            resetForm()
            fetchCategories()
            refreshCategories()
        } catch (error) {
            console.error('Error saving category:', error)
            toast.error('Failed to save category')
        }
    }

    const handleDeleteCategory = async (categoryId) => {
        if (!confirm('Are you sure you want to delete this category?')) {
            return
        }

        try {
            await db.delete(Categories).where(eq(Categories.id, categoryId))
            toast.success('Category deleted successfully!')
            fetchCategories()
            refreshCategories()
        } catch (error) {
            console.error('Error deleting category:', error)
            toast.error('Failed to delete category')
        }
    }

    const handleEditCategory = (category) => {
        setEditingCategory(category)
        setCategoryName(category.name)
        setCategoryIcon(category.icon || '📁')
        setCategoryColor(category.color || '#4845d2')
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setCategoryName('')
        setCategoryIcon('📁')
        setCategoryColor('#4845d2')
        setEditingCategory(null)
        setIsDialogOpen(false)
        setShowEmojiPicker(false)
    }

    const onEmojiClick = (emojiData) => {
        setCategoryIcon(emojiData.emoji)
        setShowEmojiPicker(false)
    }

    // Create default categories if none exist
    useEffect(() => {
        if (user && categories.length === 0) {
            createDefaultCategories()
        }
    }, [user, categories])

    const createDefaultCategories = async () => {
        const defaultCategories = [
            { name: 'Food & Dining', icon: '🍔', color: '#ef4444' },
            { name: 'Transportation', icon: '🚗', color: '#3b82f6' },
            { name: 'Shopping', icon: '🛍️', color: '#8b5cf6' },
            { name: 'Entertainment', icon: '🎮', color: '#f59e0b' },
            { name: 'Bills & Utilities', icon: '💡', color: '#06b6d4' },
            { name: 'Healthcare', icon: '🏥', color: '#22c55e' },
            { name: 'Education', icon: '📚', color: '#4845d2' },
            { name: 'Others', icon: '📌', color: '#6b7280' }
        ]

        try {
            for (const category of defaultCategories) {
                await db.insert(Categories).values({
                    ...category,
                    createdBy: user.primaryEmailAddress?.emailAddress
                })
            }
            fetchCategories()
        } catch (error) {
            console.error('Error creating default categories:', error)
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Expense Categories</h3>
                <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Category
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="p-4 border rounded-lg bg-black hover:bg-gray-900 transition-colors"
                        style={{ borderColor: category.color }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{category.icon}</span>
                            <div className="flex gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => handleEditCategory(category)}
                                >
                                    <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-red-500 hover:text-red-600"
                                    onClick={() => handleDeleteCategory(category.id)}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                        <div className="text-sm font-medium">{category.name}</div>
                    </div>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Category' : 'Create New Category'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory ? 'Update category details' : 'Add a new expense category'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="name">Category Name</label>
                            <Input
                                id="name"
                                placeholder="e.g., Groceries"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <label>Icon</label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="w-20"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                >
                                    <span className="text-2xl">{categoryIcon}</span>
                                </Button>
                                <div className="text-sm text-gray-400 flex items-center">
                                    Click to choose an icon
                                </div>
                            </div>
                            {showEmojiPicker && (
                                <div className="absolute z-50">
                                    <EmojiPicker
                                        onEmojiClick={onEmojiClick}
                                        theme="dark"
                                        height={350}
                                        width={300}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <label>Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {predefinedColors.map((color) => (
                                    <button
                                        key={color}
                                        className={`w-10 h-10 rounded-lg border-2 ${
                                            categoryColor === color ? 'border-white' : 'border-transparent'
                                        }`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setCategoryColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSaveCategory}>
                            {editingCategory ? 'Update' : 'Create'} Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CategoriesManager
