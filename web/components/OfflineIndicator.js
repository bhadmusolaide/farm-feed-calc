'use client';

import { useOfflineStore } from '../lib/hybridStore';
import { WifiOff } from 'lucide-react';

function OfflineIndicator() {
  const { isOnline } = useOfflineStore();

  if (isOnline) return null;

  return (
    <div className="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center space-x-2">
      <WifiOff size={16} />
      <span>You're offline. Some features may be limited.</span>
    </div>
  );
}

export { OfflineIndicator };
export default OfflineIndicator;