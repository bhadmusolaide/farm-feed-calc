'use client';

import { useState, useEffect } from 'react';
import { Download, Users, Mail, Calendar, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from './Toast';

export default function WaitlistAdmin() {
  const [waitlistData, setWaitlistData] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0, thisWeek: 0, thisMonth: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Get current Firebase ID token for Authorization header (client-side only)
  const getIdToken = async () => {
    try {
      if (typeof window === 'undefined') return null; // guard SSR
      const mod = await import('firebase/auth');
      // Avoid relying on named re-export structure; use default import from our client initializer
      const client = await import('../lib/firebase');
      const clientAuth = client.auth;
      const user = clientAuth?.currentUser;
      if (!user) return null;
      return await user.getIdToken(false);
    } catch (e) {
      console.error('Failed to get Firebase ID token:', e);
      return null;
    }
  };

  const fetchWaitlistData = async () => {
    try {
      setIsLoading(true);
      const token = await getIdToken();
      const response = await fetch('/api/waitlist', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const maybeJson = (() => {
        try { return response.headers.get('content-type')?.includes('application/json'); } catch { return false; }
      })();
      const payload = maybeJson ? await response.json().catch(() => ({})) : {};

      if (response.ok) {
        setWaitlistData(payload.entries || []);
        setStats(payload.stats || { total: 0, today: 0, thisWeek: 0, thisMonth: 0 });
      } else {
        const reason = payload?.error || payload?.message || `HTTP ${response.status}`;
        throw new Error(`Failed to fetch waitlist data: ${reason}`);
      }
    } catch (error) {
      console.error('Error fetching waitlist data:', error);
      toast.error(error?.message || 'Failed to load waitlist data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Ensure this only runs on the client to avoid SSR errors
    if (typeof window !== 'undefined') {
      fetchWaitlistData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['Position', 'Email', 'Name', 'Date Joined'];
      const csvContent = [
        headers.join(','),
        ...waitlistData.map((entry, index) => [
          index + 1,
          `"${entry.email}"`,
          `"${entry.name || 'N/A'}"`,
          new Date(entry.timestamp).toLocaleDateString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `waitlist-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Waitlist exported successfully!');
    } catch (error) {
      console.error('Error exporting waitlist:', error);
      toast.error('Failed to export waitlist');
    } finally {
      setIsExporting(false);
    }
  };

  const deleteEntry = async (email) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      const token = await getIdToken();
      const response = await fetch('/api/waitlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email })
      });
      const maybeJson = (() => {
        try { return response.headers.get('content-type')?.includes('application/json'); } catch { return false; }
      })();
      const payload = maybeJson ? await response.json().catch(() => ({})) : {};

      if (response.ok) {
        toast.success('Entry deleted successfully');
        fetchWaitlistData(); // Refresh data
      } else {
        const reason = payload?.error || payload?.message || `HTTP ${response.status}`;
        throw new Error(`Failed to delete entry: ${reason}`);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error(error?.message || 'Failed to delete entry');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total Entries</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Today</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.today}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">This Week</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.thisWeek}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">This Month</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.thisMonth}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Waitlist Entries ({waitlistData.length})
        </h3>
        <div className="flex space-x-3">
          <button
            onClick={fetchWaitlistData}
            className="flex items-center space-x-2 px-4 py-2 text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportToCSV}
            disabled={isExporting || waitlistData.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Waitlist Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
        {waitlistData.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 dark:text-neutral-400">No waitlist entries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Date Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
                {waitlistData.map((entry, index) => (
                  <tr key={entry.email} className="hover:bg-neutral-50 dark:hover:bg-neutral-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                      {entry.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                      {entry.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                      {formatDate(entry.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteEntry(entry.email)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}