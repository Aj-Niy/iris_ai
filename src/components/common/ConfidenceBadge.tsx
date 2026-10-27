import React from 'react';
import { ForecastConfidence } from '../../types';
import { Badge, BadgeVariant } from './Badge';

export const ConfidenceBadge: React.FC<{ confidence: ForecastConfidence; tooltip?: string }> = ({
  confidence,
  tooltip,
}) => {
  let variant: BadgeVariant = 'neutral';
  switch (confidence) {
    case 'High':
      variant = 'success';
      break;
    case 'Medium':
      variant = 'warning';
      break;
    case 'Low':
      variant = 'danger';
      break;
  }

  return (
    <span title={tooltip}>
      <Badge variant={variant} size="sm" dot>
        {confidence} Confidence
      </Badge>
    </span>
  );
};
