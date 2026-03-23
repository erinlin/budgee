import React from 'react';
import classNames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={classNames(
          'budgee-input',
          { 'input-error': error },
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
