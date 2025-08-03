import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Input Component
 * Provides consistent styling and behavior for form inputs
 */
const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = true,
  leftIcon = null,
  rightIcon = null,
  className = '',
  inputClassName = '',
  id,
  name,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  // Base input classes
  const baseInputClasses = 'block w-full px-4 py-3 text-gray-900 placeholder-gray-500 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // State-based classes
  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200';
  
  // Icon padding classes
  const iconPaddingClasses = leftIcon && rightIcon
    ? 'pl-12 pr-12'
    : leftIcon
    ? 'pl-12'
    : rightIcon
    ? 'pr-12'
    : '';
  
  // Combine input classes
  const inputClasses = [
    baseInputClasses,
    stateClasses,
    iconPaddingClasses,
    fullWidth ? 'w-full' : '',
    inputClassName
  ].filter(Boolean).join(' ');
  
  // Container classes
  const containerClasses = [
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">
              {leftIcon}
            </span>
          </div>
        )}
        
        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        
        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-gray-400">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-2 text-sm text-red-600 flex items-center"
        >
          <span className="material-icons text-sm mr-1">error</span>
          {error}
        </p>
      )}
      
      {/* Helper Text */}
      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="mt-2 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  autoComplete: PropTypes.string,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
};

export default Input;
