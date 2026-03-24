import { forwardRef } from 'react'

export const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading, 
  disabled, 
  ...props 
}, ref) => {
  
  const baseClass = variant === 'primary' 
    ? 'btn-primary' 
    : variant === 'secondary' 
      ? 'btn-secondary'
      : 'btn-accent'
      
  const loadingState = isLoading ? 'opacity-70 cursor-wait' : ''
  const disabledState = disabled ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100 active:scale-100' : ''
  
  return (
    <button 
      ref={ref}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center ${baseClass} ${loadingState} ${disabledState} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'
