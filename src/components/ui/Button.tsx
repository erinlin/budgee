import React from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, ...props }, ref) => {
    // As we use vanilla CSS for the most part, I'll inline the classes using standard utility-like naming.
    // Given the proposal said "Vanilla CSS", we should probably link to index.css or use modules.
    // For simplicity, I'll write styles in index.css and use simple classnames here.
    return (
      <button
        ref={ref}
        className={classNames(
          'budgee-btn',
          `btn-${variant}`,
          { 'w-full': fullWidth },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
