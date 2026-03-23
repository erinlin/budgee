import React from 'react';
import classNames from 'classnames';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={classNames('budgee-label', className)}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';
