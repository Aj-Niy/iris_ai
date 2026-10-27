import React from 'react';
import { ActionStatus, PaymentStatus } from '../../types';
import { Badge, BadgeVariant } from './Badge';

export const StatusBadge: React.FC<{ status: ActionStatus | PaymentStatus }> = ({ status }) => {
  let variant: BadgeVariant = 'neutral';
  let label: string = status;

  switch (status) {
    case 'Completed':
    case 'Approved':
      variant = 'success';
      break;
    case 'Simulated Complete':
      variant = 'info';
      label = 'Simulated Complete (Demo)';
      break;
    case 'Suggested':
      variant = 'warning';
      break;
    case 'Draft':
      variant = 'neutral';
      break;
    case 'Failed':
      variant = 'danger';
      break;
    case 'Cancelled':
      variant = 'neutral';
      break;
    case 'Pending':
      variant = 'warning';
      break;
  }

  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
};
