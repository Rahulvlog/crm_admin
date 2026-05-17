import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, AlertCircle, FileSpreadsheet, Download, RefreshCw, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function TaskMaster() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state mapping exactly to PHP legacy view
  const [filters, setFilters] = useState({
    client_id: '',
    project_id: '',
    emp_id: '',
    site_location: '',
    dealer_name: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, clientsRes, projectsRes, empRes] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/tasks'),
        axios.get('http://localhost:5000/api/v1/clients'),
        axios.get('http://localhost:5000/api/v1/projects'),
        axios.get('http://localhost:5000/api/v1/employees'),
      ]);
      setTasks(tasksRes.data.data || []);
      setClients(clientsRes.data.data || []);
      setProjects(projectsRes.data.data || []);
      setEmployees(empRes.data.data || []);
      setError(null);
    } catch (err) {
      console.error("API Fetch Error:", err);
      setError("Failed to fetch data from backend. Make sure the MySQL server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleResetFilters = () => {
    setFilters({ client_id: '', project_id: '', emp_id: '', site_location: '', dealer_name: '' });
  };

  // Compute filtered tasks
  const filteredTasks = tasks.filter(t => {
    if (filters.client_id && String(t.client_id) !== String(filters.client_id)) return false;
    if (filters.project_id && String(t.project_id) !== String(filters.project_id)) return false;
    if (filters.emp_id && String(t.emp_id) !== String(filters.emp_id)) return false;
    if (filters.site_location && !t.site_location?.toLowerCase().includes(filters.site_location.toLowerCase())) return false;
    if (filters.dealer_name && !t.dealer_name?.toLowerCase().includes(filters.dealer_name.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 relative">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Task Master</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">Task Master</li>
          </ol>
        </div>
      </div>

      {/* Excel Import Card -> Mimicking Legacy */}
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-indigo-100 dark:border-indigo-500/10 shadow-sm p-5 mb-6 flex flex-col lg:flex-row items-center gap-6 justify-between">
         <div>
            <h4 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center gap-2">
              <FileSpreadsheet size={20} /> 1. Insert New Task Master:
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">Task Master Insert Excel Template <a href="#" className="text-red-500 hover:text-red-600 underline ml-1 inline-flex items-center gap-1"><Download size={14}/> Download</a></p>
         </div>
         <div className="flex items-center gap-3 w-full lg:w-auto">
            <input type="file" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 cursor-pointer" accept=".xlsx, .xls" />
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap">Import Data</button>
         </div>
      </div>

      {/* Filters Card -> Exact reproduction of PHP filters */}
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 p-5">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Client Name</label>
              <select name="client_id" value={filters.client_id} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer">
                <option value="">-Select-</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Project Name</label>
              <select name="project_id" value={filters.project_id} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer">
                <option value="">-Select-</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Employee Name</label>
               <select name="emp_id" value={filters.emp_id} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer">
                <option value="">-Select-</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Site Location</label>
               <input type="text" name="site_location" value={filters.site_location} onChange={handleFilterChange} placeholder="Location Keyword" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200" />
            </div>
            <div>
               <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Dealer</label>
               <input type="text" name="dealer_name" value={filters.dealer_name} onChange={handleFilterChange} placeholder="Dealer Name" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200" />
            </div>
            <div className="flex items-end gap-2 lg:col-span-3">
               <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer">Search</button>
               <button onClick={handleResetFilters} className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"><RefreshCw size={14} /> Reset</button>
            </div>
         </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 dark:bg-slate-900">
           <h3 className="font-semibold text-white">Task Master List</h3>
           <div className="flex items-center gap-3">
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors backdrop-blur-md border border-white/10 shadow-sm">
                 <Plus size={16} /> Add New
              </button>
              <button className="bg-rose-500/80 hover:bg-rose-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors backdrop-blur-md border border-rose-400/20 shadow-sm">
                 <Trash2 size={16} /> Delete All
              </button>
           </div>
        </div>
        
        {/* Dynamic Table Content Area */}
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
          ) : filteredTasks.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-500 italic text-sm">
               No assignments found matching these filters. Add records to view them here.
             </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 font-bold uppercase">
                  <th className="px-5 py-4 w-12 text-center">
                    <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-transparent" />
                  </th>
                  <th className="px-5 py-4 w-16">S.No.</th>
                  <th className="px-5 py-4">Project Name</th>
                  <th className="px-5 py-4">Client Name</th>
                  <th className="px-5 py-4">Assign employee</th>
                  <th className="px-5 py-4">Site Location</th>
                  <th className="px-5 py-4">Dealer Name</th>
                  <th className="px-5 py-4">Created DateTime</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Task Status</th>
                  <th className="px-5 py-4 text-center sticky right-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t, idx) => (
                  <tr key={t.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-5 py-3 text-center">
                       <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-transparent" />
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t.project_name || '-'}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t.client_name || '-'}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{/* employee specific name wasn't joined in the route, we fallback */employees.find(e => e.id === t.emp_id)?.name || '-'}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t.site_location || '-'}</td>
                    <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">{t.dealer_name || '-'}</td>
                    
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400 text-center">
                       {t.created_date ? new Date(t.created_date).toLocaleString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit', second:'2-digit'}) : '-'}
                    </td>

                    <td className="px-5 py-3 text-sm font-medium">
                       {t.status == 0 && <span className="text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-md">Pending</span>}
                       {t.status == 1 && <span className="text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md">In-Process</span>}
                       {t.status == 2 && <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md">Completed</span>}
                    </td>

                    <td className="px-5 py-3 text-sm font-medium">
                       {t.task_status == 0 && <span className="text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-md">Inactive</span>}
                       {t.task_status == 1 && <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md">Active</span>}
                    </td>

                    <td className="px-5 py-3 text-sm text-center sticky right-0 bg-white/50 dark:bg-slate-950/50 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 backdrop-blur-sm transition-colors">
                      <button className="text-cyan-600 hover:text-cyan-800 dark:text-cyan-400 dark:hover:text-cyan-300 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/30 dark:hover:bg-cyan-900/50 font-medium px-3 py-1.5 rounded-lg relative z-10 transition-colors">
                         Edit
                      </button>
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
