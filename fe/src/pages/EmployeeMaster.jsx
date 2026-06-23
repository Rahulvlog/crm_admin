import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function EmployeeMaster() {
  const [employees, setEmployees] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [onlineStatus, setOnlineStatus] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, cityRes] = await Promise.all([
        axios.get('/api/app-users/'),
        axios.get('/api/city-master/')
      ]);
      setEmployees(empRes.data.data || []);
      setCities(cityRes.data.data || []);
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

  const getCityName = (cityData) => {
    if (!cityData) return '-';
    if (typeof cityData === 'object') return cityData.name || '-';
    const city = cities.find(c => c.id == cityData);
    return city ? city.name : '-';
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await axios.delete(`/api/app-users/${id}/`, {
        headers: {
          'accesstoken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mjg0LCJleHAiOjE3NjY0MTIzOTIsImlhdCI6MTc2NTgwNzU5Mn0.7HxWWa3-13A-5aTB2-KUalb4JBXKkclf6o6JGTDtAC8'
        }
      });
      fetchData(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete employee. Please try again.");
    }
  };

  const getRole = (roleType) => {
    // Typically matched to specific integers in DB
    if (roleType == 2) return "Client";
    if (roleType == 3) return "Employee";
    if (roleType == 5) return "Staff";
    return roleType;
  }

  const filteredEmployees = employees.filter(e => {
    if (onlineStatus !== '' && String(e.online_status) !== String(onlineStatus)) return false;
    return true;
  });

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 relative">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">Employee Master</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">Employee Master</li>
          </ol>
        </div>
      </div>

      {/* Filters Card -> Exact reproduction of PHP Search Online Status */}
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 flex flex-col">
        <div className="bg-indigo-600 dark:bg-slate-900 p-3 rounded-t-3xl border-b border-indigo-700 dark:border-slate-800 text-white font-semibold">
          Search Online Status
        </div>
        <div className="p-4 flex items-end gap-4">
          <div className="w-64">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Online Status</label>
            <select value={onlineStatus} onChange={(e) => setOnlineStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer">
              <option value="">-Select-</option>
              <option value="1">Online</option>
              <option value="0">Offline</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer">Search</button>
            <button onClick={() => setOnlineStatus('')} className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 px-5 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"><RefreshCw size={14} /> Reset</button>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 dark:bg-slate-900">
          <h3 className="font-semibold text-white">Employee Master List</h3>
          <Link to="/add-user" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors backdrop-blur-md border border-white/10 shadow-sm">
            <Plus size={16} /> Add New
          </Link>
        </div>

        <div className="overflow-x-auto w-full">
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
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 italic text-sm">
              No employees found. Add records to view them here.
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 font-bold uppercase">
                  <th className="px-5 py-4 w-16">S.No.</th>
                  <th className="px-5 py-4">Employee Name & Code</th>
                  <th className="px-5 py-4">Mobile No. / Login ID</th>
                  <th className="px-5 py-4">Password</th>
                  <th className="px-5 py-4">City</th>
                  <th className="px-5 py-4">Address</th>
                  <th className="px-5 py-4">Latitude</th>
                  <th className="px-5 py-4">Longitude</th>
                  <th className="px-5 py-4">Role Type</th>
                  <th className="px-5 py-4 text-center">Created Date</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Online Status</th>
                  <th className="px-5 py-4 text-center sticky right-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((e, idx) => (
                  <tr key={e.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                    <td className="px-5 py-3 text-sm text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400 leading-tight">
                      {e.name || '-'} <br />
                      <span className="text-xs font-normal text-slate-400 dark:text-slate-500">({e.profile_code})</span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">{e.mobile_no || '-'}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-400 dark:text-slate-500">{e.password || '-'}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">{getCityName(e.city)}</td>
                    <td className="px-5 py-3 text-sm text-slate-500 max-w-[150px] truncate" title={e.address}>{e.address || '-'}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">{e.latitude || '-'}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">{e.longitude || '-'}</td>
                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{getRole(e.role_type)}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 text-center">
                      {e.created_date ? new Date(e.created_date).toLocaleDateString('en-GB') : '-'}
                    </td>

                    <td className="px-5 py-3 text-sm font-medium text-center">
                      {e.status == 1 ? (
                        <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-500/20">Active</span>
                      ) : (
                        <span className="text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-500/20">Deactive</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-sm font-medium text-center">
                      {e.online_status == 1 ? (
                        <span className="text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-200 dark:border-cyan-500/20">Online</span>
                      ) : (
                        <span className="text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-500/20">Offline</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-sm text-center sticky right-0 bg-white/50 dark:bg-slate-950/50 group-hover:bg-slate-50/50 dark:group-hover:bg-slate-800/20 backdrop-blur-sm transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/edit-user/${e.id}`} className="text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1.5 rounded-lg transition-colors">Edit</Link>
                        <button onClick={() => handleDelete(e.id)} className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 px-3 py-1.5 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
