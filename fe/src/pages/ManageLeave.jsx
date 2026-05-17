import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw, Download, FileText } from 'lucide-react';
import axios from 'axios';

export default function ManageLeave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/v1/leaves');
      setLeaves(res.data.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch data from backend. Make sure the MySQL server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 relative">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Leave List</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">Leave Master</li>
          </ol>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 dark:bg-slate-900">
           <h3 className="font-semibold text-white">Leave Application List</h3>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-indigo-500">
               <Loader2 className="animate-spin mb-4" size={32} />
               <p className="text-sm font-medium text-slate-500">Syncing with MySQL...</p>
             </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center h-64 text-rose-500 p-8 text-center max-w-lg mx-auto">
               <AlertCircle className="mb-4" size={48} />
               <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-2">{error}</p>
             </div>
          ) : leaves.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic text-sm">
               No leave records found.
             </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 font-bold uppercase">
                  <th className="px-5 py-4 w-16">S.No.</th>
                  <th className="px-5 py-4">Employee Name</th>
                  <th className="px-5 py-4">In Date & Time</th>
                  <th className="px-5 py-4">Leave Type</th>
                  <th className="px-5 py-4">From Date</th>
                  <th className="px-5 py-4">To Date</th>
                  <th className="px-5 py-4">No. of Days</th>
                  <th className="px-5 py-4">Subject</th>
                  <th className="px-5 py-4 w-64">Message</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center sticky right-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l, idx) => (
                  <tr key={l.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-5 py-3 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{l.name || '-'}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                       {l.created_at ? new Date(l.created_at).toLocaleString('en-GB') : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                       {l.leave_type == 0 ? "Casual Leave" : "Other"}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                       {l.from_date ? new Date(l.from_date).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                       {l.to_date ? new Date(l.to_date).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-slate-700 dark:text-slate-300">{l.no_of_days || 0}</td>
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{l.subject || '-'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                       {l.message || '-'}
                       {l.file && (
                           <a href={l.file} target="_blank" rel="noreferrer" className="block mt-1 text-xs text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-1">
                               <FileText size={12}/> View File
                           </a>
                       )}
                    </td>

                    <td className="px-5 py-3 text-sm font-medium text-center">
                       {l.status == 1 ? (
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">Approved</span>
                       ) : l.status == 0 ? (
                          <span className="text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-500/20">Pending</span>
                       ) : (
                          <span className="text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-500/20">Rejected</span>
                       )}
                    </td>

                    <td className="px-5 py-3 text-sm text-center sticky right-0 bg-white/50 dark:bg-slate-950/50 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 backdrop-blur-sm transition-colors">
                      <div className="flex items-center flex-col justify-center gap-1">
                        <button className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-lg transition-colors w-full text-xs font-semibold">Update Status</button>
                        <button className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 px-3 py-1 rounded-lg transition-colors w-full text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
