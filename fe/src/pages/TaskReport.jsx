import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, RefreshCw, FileSpreadsheet, Download } from 'lucide-react';
import axios from 'axios';

export default function TaskReport() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/v1/tasks');
      setTasks(res.data.data || []);
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
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Task Report</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">Task Report</li>
          </ol>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 p-5">
         <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4">Master View Filters</h4>
         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Project Name</label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Client Name</label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Employee Name</label>
               <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">State</label>
               <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">District</label>
               <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Tehsil</label>
               <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"><option>--select--</option></select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Site Location</label>
               <input type="text" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Dealer Name</label>
               <input type="text" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">From Date</label>
               <input type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">To Date</label>
               <input type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
            </div>
            
            <div className="flex items-end justify-start lg:col-span-2 mt-2 gap-2">
               <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-2"><Search size={14}/> Search</button>
               <button className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"><RefreshCw size={14} /> Reset</button>
            </div>
         </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 dark:bg-slate-900">
           <h3 className="font-semibold text-white">Consolidated Analysis</h3>
           <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors backdrop-blur-md border border-white/10 shadow-sm">
              <FileSpreadsheet size={16} /> Excel Export
           </button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-indigo-500">
               <Loader2 className="animate-spin mb-4" size={32} />
             </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center h-64 text-rose-500 p-8 text-center max-w-lg mx-auto">
               <AlertCircle className="mb-4" size={48} />
               <p className="text-sm font-medium text-rose-600 dark:text-rose-400 mb-2">{error}</p>
             </div>
          ) : tasks.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic text-sm">
               No records found matching filters.
             </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 font-bold uppercase">
                  <th className="px-5 py-4 w-16">SNo.</th>
                  <th className="px-5 py-4">Ref No. & DateTime</th>
                  <th className="px-5 py-4">Project Detail</th>
                  <th className="px-5 py-4">Employee_Name</th>
                  <th className="px-5 py-4">Size_of_DWP</th>
                  <th className="px-5 py-4">Dealer Info</th>
                  <th className="px-5 py-4">Site Location</th>
                  <th className="px-5 py-4 text-center">Photo</th>
                  <th className="px-5 py-4">View</th>
                  <th className="px-5 py-4">Address</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center sticky right-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t, idx) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-5 py-3 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                       {t.created_date ? new Date(t.created_date).toLocaleString('en-GB') : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Flex ID:</span> {t.id} <br/>
                        <span className="font-bold text-slate-800 dark:text-slate-200">Project:</span> {t.project_name}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">Employee #{t.emp_id}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{t.lex_size || '-'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{t.dealer_name || '-'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{t.site_location || '-'}</td>
                    
                    <td className="px-5 py-3 text-center">
                       {t.photo ? <img src={t.photo} alt="t" className="w-10 h-10 rounded-md object-cover shadow-sm mx-auto" /> : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{t.view_name || '-'}</td>
                    <td className="px-5 py-3 text-sm text-slate-500">{t.gps_address || '-'}</td>

                    <td className="px-5 py-3 text-sm font-medium text-center">
                       {t.status == 1 ? (
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">Completed</span>
                       ) : (
                          <span className="text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-500/20">Pending</span>
                       )}
                    </td>

                    <td className="px-5 py-3 text-sm text-center sticky right-0 bg-white/50 dark:bg-slate-950/50 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 backdrop-blur-sm transition-colors">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <button className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 px-3 py-1 rounded-lg transition-colors text-xs font-semibold whitespace-nowrap w-24">Delete</button>
                        <button className="text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-lg transition-colors text-xs font-semibold whitespace-nowrap w-24">Remark</button>
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
