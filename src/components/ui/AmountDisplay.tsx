import React from 'react';
import classNames from 'classnames';
import { fmt } from '../../utils/fmt';

interface AmountDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({ amount, size, className, ...props }) => {
  const rounded = Math.round(amount);

  let colorClass = '';
  if (rounded > 0) {
    colorClass = 'text-danger';
  } else if (rounded < 0) {
    colorClass = 'text-success';
  } else {
    colorClass = 'text-muted';
  }

  const sizeClass = size === 'lg' ? 'amount-lg' : size === 'sm' ? 'amount-sm' : '';

  return (
    <span className={classNames('amount-display', colorClass, sizeClass, className)} {...props}>
      {rounded < 0 ? '-' : ''}{fmt(Math.abs(rounded))}
    </span>
  );
};
