import { forwardRef } from 'react'

export const Input = forwardRef(({ 
  label,
  error,
  className = '', 
  id,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-white/80 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`input-field ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/50' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
