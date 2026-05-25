import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';

export default function AddProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: '',
    status: 1
  });

  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const res = await axios.get(`/api/project-master/${id}/`);
          if (res.data?.data) {
            const d = res.data.data;
            setFormData({
              title: d.title || '',
              start_date: d.start_date ? d.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
              end_date: d.end_date ? d.end_date.split('T')[0] : '',
              description: d.description || '',
              status: d.status ?? 1
            });
          }
        } catch (e) {
          console.error("Failed to fetch project details", e);
        }
      };
      fetchProject();
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
    if (!formData.title.trim()) {
      setError("Please enter a Project Title.");
      return;
    }
    if (!formData.start_date) {
      setError("Please select a Start Date.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'accesstoken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mjg0LCJleHAiOjE3NjY0MTIzOTIsImlhdCI6MTc2NTgwNzU5Mn0.7HxWWa3-13A-5aTB2-KUalb4JBXKkclf6o6JGTDtAC8'
        }
      };

      let manager_id = null;
      try {
        const userDataStr = localStorage.getItem('user');
        if (userDataStr) {
          // Extract just the integer ID instead of sending the whole user object
          manager_id = JSON.parse(userDataStr).id;
          console.log(manager_id);
        }
      } catch (e) {
        console.error("Could not parse user from local storage");
      }

      const payload = { ...formData, manager_id };

      console.log("PAYLOAD BEING SENT TO BACKEND:", payload);

      if (id) {
        await axios.put(`/api/project-master/${id}/`, payload, config);
      } else {
        await axios.post('/api/project-master/', payload, config);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/project-master');
      }, 1500);
    } catch (err) {
      console.error("API Error:", err);
      let errMsg = `Failed to ${id ? 'update' : 'add'} project. Please try again.`;
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
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 max-w-4xl mx-auto w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">{id ? 'Edit Project' : 'Add Project'}</h1>
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link to="/project-master" className="hover:text-indigo-600 transition-colors">Project Master</Link></li>
            <li>/</li>
            <li className="font-semibold text-slate-900 dark:text-slate-200">{id ? 'Edit Project' : 'Add Project'}</li>
          </ol>
        </div>
        <Link to="/project-master" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors">
          <ArrowLeft size={16} /> Back to List
        </Link>
      </div>

      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-indigo-600 dark:bg-slate-900 shrink-0">
          <h3 className="font-semibold text-white">Project Details</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Error saving project</h4>
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
                <p className="text-sm">Project {id ? 'updated' : 'added'} successfully. Redirecting...</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Project Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-700 dark:text-slate-200" placeholder="Enter project title" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
              <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">End Date (Optional)</label>
              <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-slate-700 dark:text-slate-200" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-700 dark:text-slate-200" placeholder="Project description..."></textarea>
            </div>

            <div className="flex gap-6 pt-2 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="status" checked={formData.status === 1} onChange={(e) => handleChange({ target: { name: 'status', value: e.target.checked ? 1 : 0 } })} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Status</span>
              </label>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
            <Link to="/project-master" className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Saving...' : (id ? 'Update Project' : 'Save Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
