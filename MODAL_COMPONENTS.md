# Modal Components Documentation

## Overview
This document describes the reusable modal components created for the expense tracker calendar UI.

## Components

### 1. Modal Component (`components/ui/modal.jsx`)

A reusable modal component with the following features:

#### Props
- `isOpen` (boolean): Controls modal visibility
- `onClose` (function): Callback when modal should close
- `title` (string): Modal header title
- `children` (ReactNode): Modal content
- `className` (string, optional): Additional CSS classes

#### Features
- **White background** with rounded corners and shadow
- **Click outside to close** functionality
- **Escape key** to close
- **Body scroll prevention** when modal is open
- **Responsive design** with max width and height constraints
- **Smooth animations** with CSS transitions

#### Usage
```jsx
<Modal 
  isOpen={isModalOpen} 
  onClose={closeModal}
  title="Modal Title"
  className="max-w-lg"
>
  <div>Modal content goes here</div>
</Modal>
```

### 2. ExpenseCard Component (`components/ui/expense-card.jsx`)

A card component for displaying individual expenses:

#### Props
- `expense` (object): Expense data with name, amount, and notes

#### Features
- **Card-like styling** with subtle borders and hover effects
- **Bold title** for expense name
- **Gray amount text** below the title
- **Optional notes** display in italic text
- **Currency formatting** with rupee symbol
- **Responsive design**

#### Usage
```jsx
<ExpenseCard expense={expenseData} />
```

## Calendar Integration

### Updated Calendar Behavior

The calendar now features:

1. **Clean Grid Layout**: 
   - Small square date cells with dark backgrounds
   - Hover effects with scale animation
   - Today's date highlighted in blue

2. **Modal Interaction**:
   - Click any date to open expense modal
   - Modal shows all expenses for that date
   - Scrollable content for many expenses
   - Empty state when no expenses exist

3. **Visual Improvements**:
   - Smooth transitions and animations
   - Consistent spacing and typography
   - Professional color scheme
   - Responsive design

## Styling

### Color Scheme
- **Modal**: White background with gray borders
- **Calendar dates**: Dark gray (`bg-gray-800`) with hover effects
- **Today's date**: Blue (`bg-blue-600`)
- **Expense amounts**: Green for positive values
- **Text**: Various gray shades for hierarchy

### Animations
- **Hover effects**: Scale up (105%) with smooth transition
- **Active states**: Scale down (95%) for click feedback
- **Modal**: Fade in/out with backdrop blur
- **Transitions**: 200ms duration for smooth interactions

## Accessibility

- **Keyboard navigation**: Escape key closes modal
- **ARIA labels**: Close button has proper aria-label
- **Focus management**: Modal traps focus when open
- **Screen reader support**: Proper semantic HTML structure

## Browser Support

- Modern browsers with CSS Grid support
- TailwindCSS classes for consistent styling
- React 18+ for component functionality
