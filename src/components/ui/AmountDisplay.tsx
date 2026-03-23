import React from 'react';
import classNames from 'classnames';

interface AmountDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({ amount, className, ...props }) => {
  let colorClass = '';
  
  // Rules from design: positive is Owed (Red), negative is Refund (Green).
  // E.g. 待收 = 分攤總額 - 代墊 - 已收
  // 正值 = 應繳給會計 -> Red
  // 負值 = 會計要退還 -> Green
  if (amount > 0) {
    colorClass = 'text-danger';
  } else if (amount < 0) {
    colorClass = 'text-success';
  } else {
    colorClass = 'text-muted';
  }

  // Format amount (e.g., TWD format usually is zero-decimal)
  const formattedAmount = Math.abs(amount).toLocaleString('en-US');

  return (
    <span className={classNames('amount-display', colorClass, className)} {...props}>
      {amount < 0 ? '-' : ''}${formattedAmount}
    </span>
  );
};
