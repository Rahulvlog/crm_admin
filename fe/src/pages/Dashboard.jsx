import React from 'react';
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
                <div className={`text-sm font-bold flex items-center px-2 py-1 rounded-lg ${stat.up ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>
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
}
