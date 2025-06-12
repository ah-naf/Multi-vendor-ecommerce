import LoadingSpinner from '@/components/ui/loading-spinner';
import React from 'react';

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  // For now, we'll use the generic spinner.
  // This will be centered within the <main> content area of dashboard-customer/layout.tsx
  return <LoadingSpinner />;
}
