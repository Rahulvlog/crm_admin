import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertCircle, Trash2, Download, RefreshCw, Eye } from 'lucide-react';
import axios from 'axios';

export default function ManageAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core filters mapping exactly to manage_attendance.php
  const [filters, setFilters] = useState({
    employee_name: '',
    from_date: '',
    to_date: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [attRes, empRes] = await Promise.all([
        axios.get('http://localhost:5000/api/v1/attendance'),
        axios.get('http://localhost:5000/api/v1/employees')
      ]);
      setAttendance(attRes.data.data || []);
      // Technically "Site Location" filter label was mapped to employee_name array in PHP
      setEmployees(empRes.data.data || []);
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

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleResetFilters = () => {
    setFilters({ employee_name: '', from_date: '', to_date: '' });
  };

  // Filter computation
  const filteredAttendance = attendance.filter(a => {
     let inDateMatches = true;
     let outDateMatches = true;

     if (filters.from_date) {
         if (!a.indate || new Date(a.indate) < new Date(filters.from_date)) inDateMatches = false;
     }
     if (filters.to_date) {
         if (!a.indate || new Date(a.indate) > new Date(filters.to_date)) outDateMatches = false;
     }

     return inDateMatches && outDateMatches;
  });

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 relative">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Manage Attendance</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">Manage Attendance</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Search Data Card */}
        <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col">
            <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-4">Search Filters</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">SITE LOCATION / EMP</label>
                <select name="employee_name" value={filters.employee_name} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer">
                  <option value="">--select--</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div>
                 <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">FROM DATE</label>
                 <input type="date" name="from_date" value={filters.from_date} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200" />
              </div>
              <div>
                 <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">TO DATE</label>
                 <input type="date" name="to_date" value={filters.to_date} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200" />
              </div>
            </div>
            <div className="flex gap-2">
               <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-2"><Search size={14}/> Search</button>
               <button onClick={handleResetFilters} className="bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2"><RefreshCw size={14} /> Reset</button>
            </div>
        </div>

        {/* Export Data Card */}
        <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col">
            <h4 className="text-sm font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-4">Export</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                 <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">FROM DATE</label>
                 <input type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200" />
              </div>
              <div>
                 <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">TO DATE</label>
                 <input type="date" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200" />
              </div>
            </div>
            <div>
               <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-2"><Download size={14}/> Export</button>
            </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 dark:bg-slate-900">
           <h3 className="font-semibold text-white">Attendance List</h3>
           <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors backdrop-blur-md border border-white/10 shadow-sm">
              <Download size={16} /> Print Records
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
          ) : filteredAttendance.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic text-sm">
               No attendance logs found matching constraints.
             </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 font-bold uppercase">
                  <th className="px-5 py-4 w-16">S.No.</th>
                  <th className="px-5 py-4">Employee Name</th>
                  <th className="px-5 py-4">In Date & Time</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4 text-center">In Image</th>
                  <th className="px-5 py-4">Out Date & Time</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4 text-center">Out Image</th>
                  <th className="px-5 py-4 text-center">Duration</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center sticky right-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((a, idx) => (
                  <tr key={a.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-5 py-3 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">{a.employee_name || '-'}</td>
                    {/* Database fields from tbl_attendance logic might vary. Assuming standard fields exist via API mapper */}
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                       {a.indate} <br/><span className="text-indigo-500 text-xs">{a.intime}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 max-w-[150px] truncate" title={a.inaddress}>{a.inaddress || '-'}</td>
                    <td className="px-5 py-3 text-center">
                       {a.inphoto ? <img src={a.inphoto} alt="in" className="w-10 h-10 rounded-md object-cover shadow-sm mx-auto" /> : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                       {a.outdate ? (<>{a.outdate} <br/><span className="text-indigo-500 text-xs">{a.outtime}</span></>) : (<span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">Not Checked Out</span>)}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500 max-w-[150px] truncate" title={a.outaddress}>{a.outaddress || '-'}</td>
                    <td className="px-5 py-3 text-center">
                       {a.outphoto ? <img src={a.outphoto} alt="out" className="w-10 h-10 rounded-md object-cover shadow-sm mx-auto" /> : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 text-center">
                       {a.tot_hrs && a.tot_hrs !== "0" ? a.tot_hrs : "00:00:00"}
                    </td>

                    <td className="px-5 py-3 text-sm font-medium text-center">
                       {a.checkOutDone === 'Yes' ? (
                          <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">Completed</span>
                       ) : (
                          <span className="text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-500/20">In Progress</span>
                       )}
                    </td>

                    <td className="px-5 py-3 text-sm text-center sticky right-0 bg-white/50 dark:bg-slate-950/50 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 backdrop-blur-sm transition-colors">
                      <button className="text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/30 w-8 h-8 flex items-center justify-center rounded-lg transition-colors mx-auto">
                         <Eye size={16} />
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
