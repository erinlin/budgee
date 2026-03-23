import React from 'react';
import classNames from 'classnames';
import type { Role } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  role: Role;
}

export const Badge: React.FC<BadgeProps> = ({ role, className, ...props }) => {
  const roleLabels: Record<Role, string> = {
    organizer: '主辦人',
    accountant: '會計',
    member: '一般成員',
  };

  const roleStyles: Record<Role, string> = {
    organizer: 'badge-primary',
    accountant: 'badge-secondary',
    member: 'badge-default',
  };

  return (
    <span
      className={classNames('budgee-badge', roleStyles[role], className)}
      {...props}
    >
      {roleLabels[role]}
    </span>
  );
};
