import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  'Dashboard', 'ClientReport', 'TaskMaster', 'TaskReport', 
  'StateMaster', 'CityMaster', 'ProjectMaster', 'ClientMaster', 
  'EmployeeMaster', 'ManageAttendance', 'ManageLeave'
];

pages.forEach(page => {
  const isDashboard = page === 'Dashboard';
  const pageTitle = page.replace(/([A-Z])/g, ' $1').trim();
  
  let content = '';
  
  if (isDashboard) {
    content = `import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex justify-between items-end mb-8 relative">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">Workspace Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[15px]">Here's what's happening in your CRM today.</p>
        </div>
        <div className="text-sm font-semibold px-4 py-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 flex items-center shadow-sm backdrop-blur-sm">
           <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
           System Online
         </div>
      </div>
      
      {/* Actionable Insights / Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {[
           { title: "Total Clients", val: "1,248", up: true, pct: "+12%" },
           { title: "Active Projects", val: "42", up: true, pct: "+4%" },
           { title: "Pending Tasks", val: "89", up: false, pct: "-2%" },
           { title: "Revenue (MTD)", val: "$48.4k", up: true, pct: "+8%" }
         ].map((stat, i) => (
            <div key={i} className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all group cursor-pointer hover:-translate-y-1">
              <div className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-4">{stat.title}</div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.val}</div>
                <div className={\`text-sm font-bold flex items-center px-2 py-1 rounded-lg \${stat.up ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'}\`}>
                  {stat.pct}
                </div>
              </div>
            </div>
         ))}
      </div>

      <div className="flex-1 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-sm rotate-3">
             <LayoutDashboard size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Premium Interface Enabled</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-[15px]">
            Please use the Sidebar navigation to access exactly the modules configured from the legacy system.
          </p>
        </div>
      </div>
    </div>
  );
}`;
  } else {
    content = `import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';

export default function ${page}() {
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
        
        {/* Table Content Area */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Name / Reference</th>
                <th className="px-6 py-4 font-semibold">Date Created</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((item) => (
                <tr key={item} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">#REF-{item}04{item}2</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">Example Entry Variant {item}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 24, 2023</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/20 shadow-sm">Active</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium px-2 py-1 relative z-10 transition-colors">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}`;
  }
  
  fs.writeFileSync(path.join(__dirname, 'src/pages', \`\${page}.jsx\`), content);
});
console.log('Successfully scaffolded all pages!');
