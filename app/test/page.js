'use client'

export default function TestAuth() {
  const handleClick = () => {
    document.cookie = 'token=test-token; path=/';
    window.location.href = '/dashboard';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <button 
        onClick={handleClick}
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        Go to Dashboard
      </button>
    </div>
  )
}