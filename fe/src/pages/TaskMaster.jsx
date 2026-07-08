import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, AlertCircle, FileSpreadsheet, Download, RefreshCw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';

export default function TaskMaster() {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importFile, setImportFile] = useState(null);

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
      const [tasksRes, clientsRes, projectsRes, empRes] = await Promise.allSettled([
        axios.get('/api/tasks-record/'),
        axios.get('/api/v1/clients'),
        axios.get('/api/project-master/'),
        axios.get('/api/app-users/'),
      ]);

      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data?.data || []);
      if (clientsRes.status === 'fulfilled') setClients(clientsRes.value.data?.data || []);
      if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data?.data || []);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value.data?.data || []);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`/api/tasks-record/${id}/`, {
        headers: {
          'accesstoken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mjg0LCJleHAiOjE3NjY0MTIzOTIsImlhdCI6MTc2NTgwNzU5Mn0.7HxWWa3-13A-5aTB2-KUalb4JBXKkclf6o6JGTDtAC8'
        }
      });
      fetchData();
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete task. Please try again.");
    }
  };

  // Compute filtered tasks safely, accounting for fields that might be expanded into objects by the backend
  const filteredTasks = tasks.filter(t => {
    const cId = typeof t.client_id === 'object' && t.client_id ? t.client_id.id : t.client_id;
    if (filters.client_id && String(cId) !== String(filters.client_id)) return false;

    const pId = typeof t.project_id === 'object' && t.project_id ? t.project_id.id : t.project_id;
    if (filters.project_id && String(pId) !== String(filters.project_id)) return false;

    const eId = typeof t.emp_id === 'object' && t.emp_id ? t.emp_id.id : t.emp_id;
    if (filters.emp_id && String(eId) !== String(filters.emp_id)) return false;

    const loc = typeof t.site_location === 'string' ? t.site_location : '';
    if (filters.site_location && !loc.toLowerCase().includes(filters.site_location.toLowerCase())) return false;

    const dName = typeof t.dealer_name === 'object' && t.dealer_name ? String(t.dealer_name.id || t.dealer_name.name || '') : String(t.dealer_name || '');
    if (filters.dealer_name && !dName.toLowerCase().includes(filters.dealer_name.toLowerCase())) return false;

    return true;
  });

  const handleDownloadTemplate = (e) => {
    e.preventDefault();
    const headers = [
      "Project Name:",
      "Client Name",
      "State",
      "City",
      "Tahsil",
      "Site Location Name",
      "Dealer",
      "Dealer Code",
      "No. of DWP",
      "Size of DWP",
      "Location Type",
      "Employee Name: *",
      "Employee Login id",
      "Employee Password",
      "Client Login ID",
      "Client Pasward"
    ];

    // Add a sample row to guide the user
    const sampleRow = [
      "Project 1",
      "Client A",
      "Maharashtra",
      "Mumbai",
      "Andheri",
      "Site A",
      "Dealer X",
      "D001",
      "5",
      "Large",
      "Urban",
      "John Doe",
      "john.doe",
      "pass123",
      "client.a",
      "cpass123"
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'task_master_template.xlsx');
  };

  const handleImportData = async () => {
    if (!importFile) {
      alert("Please select a file first.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    // Pass the filename explicitly so the backend (pandas) can detect .xlsx/.xls from the extension.
    formData.append('file', importFile, importFile.name);

    try {
      // Match the curl exactly: just multipart form-data with the "file" field, no extra headers.
      // Axios will auto-set Content-Type with the correct boundary.
      const res = await axios.post('/api/uploadTaskExcel/', formData);

      if (res.data) {
        alert("Import complete!");
        setImportFile(null);
        const fileInput = document.getElementById('import-file-input');
        if (fileInput) fileInput.value = '';
        fetchData();
      } else {
        alert("Import failed or no data returned.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-4 relative">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-1">Task Master</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</a></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">Task Master</li>
          </ol>
        </div>
      </div>

      {/* Excel Import Card -> Mimicking Legacy */}
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-2xl border border-indigo-100 dark:border-indigo-500/10 shadow-sm p-3 mb-4 flex flex-col lg:flex-row items-center gap-4 justify-between">
        <div>
          <h4 className="text-base font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
            <FileSpreadsheet size={20} /> 1. Insert New Task Master:
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">Task Master Insert Excel Template <a href="#" onClick={handleDownloadTemplate} className="text-red-500 hover:text-red-600 underline ml-1 inline-flex items-center gap-1"><Download size={14} /> Download</a></p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <input id="import-file-input" type="file" onChange={(e) => setImportFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-500/10 dark:file:text-indigo-400 cursor-pointer" accept=".csv, .xlsx, .xls" />
          <button onClick={handleImportData} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer whitespace-nowrap">Import Data</button>
        </div>
      </div>

      {/* Filters Card -> Exact reproduction of PHP filters */}
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

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
              {employees.filter(e => String(e.role_type).toLowerCase() === 'user').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Site Location</label>
            <input type="text" name="site_location" value={filters.site_location} onChange={handleFilterChange} placeholder="Location Keyword" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Dealer</label>
            <select name="dealer_name" value={filters.dealer_name} onChange={handleFilterChange} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors text-slate-700 dark:text-slate-200 cursor-pointer">
              <option value="">-Select Dealer-</option>
              {employees.filter(e => [4, '4'].includes(e.role_type) || String(e.role_type).toLowerCase() === 'dealer').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2 lg:col-span-3">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors cursor-pointer">Search</button>
            <button onClick={handleResetFilters} className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:text-rose-400 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"><RefreshCw size={14} /> Reset</button>
          </div>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600 dark:bg-slate-900">
          <h3 className="font-semibold text-white">Task Master List</h3>
          <div className="flex items-center gap-3">
            <Link to="/add-task" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors backdrop-blur-md border border-white/10 shadow-sm">
              <Plus size={16} /> Add New
            </Link>
            <button className="bg-rose-500/80 hover:bg-rose-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors backdrop-blur-md border border-rose-400/20 shadow-sm">
              <Trash2 size={16} /> Delete All
            </button>
          </div>
        </div>

        {/* Dynamic Table Content Area */}
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
                    <td className="px-5 py-3 text-sm font-semibold">
                      <Link
                        to={`/task-report?taskId=${t.id}`}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                        title="View report for this task"
                      >
                        {idx + 1}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {typeof t.project_id === 'object' && t.project_id ? t.project_id.title : (projects.find(p => p.id === t.project_id)?.title || '-')}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {typeof t.emp_id === 'object' && t.emp_id ? t.emp_id.name : (employees.find(e => e.id === t.emp_id)?.name || '-')}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {typeof t.site_location === 'object' && t.site_location ? t.site_location.name : (t.site_location || '-')}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {typeof t.dealer_name === 'object' && t.dealer_name ? t.dealer_name.name : (t.dealer_name || '-')}
                    </td>

                    <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400 text-center">
                      {t.created_date ? new Date(t.created_date).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
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
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/edit-task/${t.id}`} className="text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/30 px-3 py-1.5 rounded-lg transition-colors">Edit</Link>
                        <button onClick={() => handleDelete(t.id)} className="text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/30 px-3 py-1.5 rounded-lg transition-colors"><Trash2 size={14} /></button>
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
