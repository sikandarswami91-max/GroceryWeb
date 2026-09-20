import React from 'react';

export default function StatusBadge({ status, type = 'order' }) {
  if (!status) return null;

  if (type === 'payment') {
    const isPaid = status.toLowerCase() === 'paid';
    const isPending = status.toLowerCase() === 'pending';
    const isFailed = status.toLowerCase() === 'failed';

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          isPaid
            ? 'bg-emerald-100 text-emerald-800'
            : isPending
            ? 'bg-amber-100 text-amber-800'
            : 'bg-rose-100 text-rose-800'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
            isPaid ? 'bg-emerald-500' : isPending ? 'bg-amber-500' : 'bg-rose-500'
          }`}
        ></span>
        {status.toUpperCase()}
      </span>
    );
  }

  // Order status styling
  let badgeColor = 'bg-slate-100 text-slate-800';
  let dotColor = 'bg-slate-500';

  switch (status) {
    case 'Pending':
      badgeColor = 'bg-amber-50 text-amber-800 border border-amber-200';
      dotColor = 'bg-amber-500';
      break;
    case 'Confirmed':
      badgeColor = 'bg-blue-50 text-blue-800 border border-blue-200';
      dotColor = 'bg-blue-500';
      break;
    case 'Processing':
      badgeColor = 'bg-indigo-50 text-indigo-800 border border-indigo-200';
      dotColor = 'bg-indigo-500';
      break;
    case 'Shipped':
      badgeColor = 'bg-purple-50 text-purple-800 border border-purple-200';
      dotColor = 'bg-purple-500';
      break;
    case 'Out for Delivery':
      badgeColor = 'bg-cyan-50 text-cyan-800 border border-cyan-200';
      dotColor = 'bg-cyan-500';
      break;
    case 'Delivered':
      badgeColor = 'bg-emerald-50 text-emerald-800 border border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'Cancelled':
      badgeColor = 'bg-rose-50 text-rose-800 border border-rose-200';
      dotColor = 'bg-rose-500';
      break;
    default:
      badgeColor = 'bg-slate-100 text-slate-800';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
      {status}
    </span>
  );
}
