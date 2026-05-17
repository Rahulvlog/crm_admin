const fs = require('fs');
const path = require('path');

const endPoints = {
  ClientReport: 'tasks',
  TaskMaster: 'tasks',
  TaskReport: 'tasks',
  StateMaster: 'states',
  CityMaster: 'cities',
  ProjectMaster: 'projects',
  ClientMaster: 'clients',
  EmployeeMaster: 'employees',
  ManageAttendance: 'attendance',
  ManageLeave: 'leaves'
};

Object.entries(endPoints).forEach(([page, endpoint]) => {
  const pageTitle = page.replace(/([A-Z])/g, ' $1').trim();
  
  const content = `import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function ${page}() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(\`http://localhost:5000/api/v1/${endpoint}\`);
        setData(response.data.data || []);
        setError(null);
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError("Failed to fetch data from backend. Make sure the MySQL server and backend are running.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Safe table property extraction based on dynamic data keys
  const headers = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'id') : [];

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex justify-between items-end mb-6 relative">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">${pageTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[15px]">Manage and view your ${pageTitle.toLowerCase()} records here.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors text-sm font-semibold shadow-indigo-600/20 hover:shadow-indigo-600/40 focus:ring-4 focus:ring-indigo-500/20">
          <Plus size={18} /> Add New
        </button>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search ${pageTitle}..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm text-slate-700 dark:text-slate-200" />
          </div>
          <button className="flex items-center gap-2 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <Filter size={16} /> Filters
          </button>
        </div>
        
        {/* Dynamic Table Content Area */}
        <div className="flex-1 overflow-auto">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-64 text-indigo-500">
               <Loader2 className="animate-spin mb-4" size={32} />
               <p className="text-sm font-medium text-slate-500">Syncing with Unified Database...</p>
             </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center h-64 text-red-500 p-8 text-center max-w-lg mx-auto">
               <AlertCircle className="mb-4" size={48} />
               <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{error}</p>
             </div>
          ) : data.length === 0 ? (
             <div className="flex items-center justify-center h-64 text-slate-400 dark:text-slate-500 italic text-sm">
               No data found in MySQL table. Add records to view them here.
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 font-semibold whitespace-nowrap">ID</th>
                  {headers.map(h => (
                    <th key={h} className="px-6 py-4 font-semibold whitespace-nowrap">{h.replace(/_/g, ' ')}</th>
                  ))}
                  <th className="px-6 py-4 font-semibold text-right sticky right-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-6 py-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400">#{item.id || idx + 1}</td>
                    {headers.map(h => (
                      <td key={h} className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                        {item[h] == null ? '-' : String(item[h]).substring(0, 50)}
                        {String(item[h]).length > 50 && '...'}
                      </td>
                    ))}
                    <td className="px-6 py-4 text-sm text-right sticky right-0 bg-white/50 dark:bg-slate-950/50 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 backdrop-blur-sm transition-colors">
                      <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium px-2 py-1 relative z-10 transition-colors">Edit</button>
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
}`;
  
  fs.writeFileSync(path.join(__dirname, 'src/pages', \`\${page}.jsx\`), content);
});
console.log('Successfully re-scaffolded API-connected pages with Dynamic Data Grids!');
