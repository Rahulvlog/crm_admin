import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

export default function AddTask() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    code: '',
    client_id: '',
    project_id: '',
    emp_id: '',
    site_location: '',
    state_id: '',
    city_id: '',
    location_type: 'Indoor',
    dealer_name: '',
    flex_with_amount: '',
    flex_height_amount: '',
    status: 0,
    task_status: 1
  });

  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [statesRes, citiesRes, clientsRes, projectsRes, empRes] = await Promise.all([
          axios.get('/api/state-master/'),
          axios.get('/api/city-master/'),
          axios.get('/api/clients/'),
          axios.get('/api/project-master/'),
          axios.get('/api/app-users/')
        ]);
        setStates(statesRes.data?.data || []);
        setCities(citiesRes.data?.data || []);
        setClients(clientsRes.data?.data || []);
        setProjects(projectsRes.data?.data || []);
        setEmployees(empRes.data?.data || []);
      } catch (e) {
        console.error("Failed to load lookups");
      }
    };
    fetchLookups();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchTask = async () => {
        try {
          const res = await axios.get(`/api/tasks-record/${id}/`);
          if (res.data?.data) {
             const d = res.data.data;
             setFormData({
                code: d.code || '',
                client_id: typeof d.client_id === 'object' && d.client_id ? d.client_id.id : (d.client_id || ''),
                project_id: typeof d.project_id === 'object' && d.project_id ? d.project_id.id : (d.project_id || ''),
                emp_id: typeof d.emp_id === 'object' && d.emp_id ? d.emp_id.id : (d.emp_id || ''),
                site_location: d.site_location || '',
                state_id: typeof d.state_id === 'object' && d.state_id ? d.state_id.id : (d.state_id || ''),
                city_id: typeof d.city_id === 'object' && d.city_id ? d.city_id.id : (d.city_id || ''),
                location_type: d.location_type || 'Indoor',
                dealer_name: d.dealer_name || '',
                flex_with_amount: d.flex_with_amount || '',
                flex_height_amount: d.flex_height_amount || '',
                status: d.status ?? 0,
                task_status: d.task_status ?? 1
             });
          }
        } catch (e) {
          console.error("Failed to fetch task details", e);
        }
      };
      fetchTask();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id || !formData.project_id || !formData.emp_id) {
      setError("Please select Client, Project, and Employee.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        state_id: formData.state_id || 1,
        city_id: formData.city_id || 101
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'accesstoken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mjg0LCJleHAiOjE3NjY0MTIzOTIsImlhdCI6MTc2NTgwNzU5Mn0.7HxWWa3-13A-5aTB2-KUalb4JBXKkclf6o6JGTDtAC8'
        }
      };

      if (id) {
         await axios.put(`/api/tasks-record/${id}/`, payload, config);
      } else {
         await axios.post('/api/tasks-record/', payload, config);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/task-master');
      }, 1500);
    } catch (err) {
      console.error("API Error:", err);
      let errMsg = `Failed to ${id ? 'update' : 'assign'} task. Please try again.`;
      if (err.response?.data) {
        if (err.response.data.errors) errMsg = err.response.data.errors;
        else if (err.response.data.message) errMsg = err.response.data.message;
        else errMsg = "An unknown error occurred on the server.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">{id ? 'Edit Task' : 'Assign Task'}</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/task-master" className="hover:text-indigo-600 transition-colors">Task Master</Link></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">{id ? 'Edit Task' : 'Add Task'}</li>
          </ol>
        </div>
        <Link to="/task-master" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors">
          <ArrowLeft size={16} /> Back to List
        </Link>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-indigo-600 dark:bg-slate-900 shrink-0">
          <h3 className="font-semibold text-white">Task Details</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Error saving task</h4>
                {typeof error === 'string' ? (
                  <p className="text-sm mt-1">{error}</p>
                ) : (
                  <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                    {Object.entries(error).map(([field, msgs]) => (
                      <li key={field}>
                        <span className="font-semibold capitalize">{field.replace('_', ' ')}</span>: {Array.isArray(msgs) ? msgs.join(', ') : msgs}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-700">
              <CheckCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Success!</h4>
                <p className="text-sm">Task {id ? 'updated' : 'assigned'} successfully. Redirecting...</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Task Code</label>
              <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="TSK-001" />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Client</label>
              <select name="client_id" value={formData.client_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value="">-Select Client-</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Project</label>
              <select name="project_id" value={formData.project_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value="">-Select Project-</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Assign Employee</label>
              <select name="emp_id" value={formData.emp_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value="">-Select Employee-</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Location Type</label>
              <select name="location_type" value={formData.location_type} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Site Location (Area)</label>
              <input type="text" name="site_location" value={formData.site_location} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="Enter site area" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">State</label>
              <select name="state_id" value={formData.state_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value="">-Select State-</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">City</label>
              <select name="city_id" value={formData.city_id} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value="">-Select City-</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Dealer Name</label>
              <input type="text" name="dealer_name" value={formData.dealer_name} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="Dealer name" />
            </div>

            <div className="flex gap-4">
               <div className="flex-1">
                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Flex Width</label>
                 <input type="text" name="flex_with_amount" value={formData.flex_with_amount} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="W" />
               </div>
               <div className="flex-1">
                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Flex Height</label>
                 <input type="text" name="flex_height_amount" value={formData.flex_height_amount} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all" placeholder="H" />
               </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Task Active Status</label>
              <select name="task_status" value={formData.task_status} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Progress Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all">
                <option value="0">Pending</option>
                <option value="1">In Process</option>
                <option value="2">Completed</option>
              </select>
            </div>

          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Link to="/task-master" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : (id ? 'Update Task' : 'Assign Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
