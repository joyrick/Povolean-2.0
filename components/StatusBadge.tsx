import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface Props {
  status: 'success' | 'warning' | 'error';
  text: string;
}

export const StatusBadge: React.FC<Props> = ({ status, text }) => {
  const colors = {
    success: 'bg-green-100 text-green-700 border-green-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    error: 'bg-red-100 text-red-700 border-red-200'
  };

  const icons = {
    success: <CheckCircle className="w-4 h-4 mr-1.5" />,
    warning: <AlertTriangle className="w-4 h-4 mr-1.5" />,
    error: <XCircle className="w-4 h-4 mr-1.5" />
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
      {icons[status]}
      {text}
    </span>
  );
};