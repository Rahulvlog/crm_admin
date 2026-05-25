import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function CityMaster() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/city-master/');
      setCities(res.data.data || []);
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">City Master</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">City Master</li>
          </ol>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 dark:bg-slate-900">
           <h3 className="font-semibold text-white">City Master List</h3>
           <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors backdrop-blur-md border border-white/10 shadow-sm">
              <Plus size={16} /> Add New
           </button>
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
          ) : cities.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic text-sm">
               No cities found. Add records to view them here.
             </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 font-bold uppercase">
                  <th className="px-5 py-4 w-16">S.No.</th>
                  <th className="px-5 py-4 w-1/3">City Name</th>
                  <th className="px-5 py-4">State Name</th>
                  <th className="px-5 py-4 text-center">Created Date</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center sticky right-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((c, idx) => (
                  <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-5 py-3 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{c.name || '-'}</td>
                    {/* The backend query performs JOIN to provide state_name */}
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">{c.state_name || '-'}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 text-center leading-tight">
                       {c.created_date ? new Date(c.created_date).toLocaleString('en-GB') : '-'}
                    </td>

                    <td className="px-5 py-3 text-sm font-medium text-center">
                       {c.status == 1 ? (
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">Active</span>
                       ) : (
                          <span className="text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-500/20">Inactive</span>
                       )}
                    </td>

                    <td className="px-5 py-3 text-sm text-center sticky right-0 bg-white/50 dark:bg-slate-950/50 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 backdrop-blur-sm transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <button className="text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1.5 rounded-lg transition-colors">Edit</button>
                        <button className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 px-3 py-1.5 rounded-lg transition-colors"><Trash2 size={14}/></button>
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
