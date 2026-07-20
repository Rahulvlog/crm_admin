import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  Store,
  UserCog,
  ClipboardList,
  Loader2,
  CheckCircle2,
  Printer,
  Hourglass,
  XCircle,
  CheckCheck,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

const CARD_THEMES = {
  indigo:  { bg: 'from-indigo-500 to-indigo-600',   soft: 'bg-indigo-50 dark:bg-indigo-500/10',   text: 'text-indigo-600 dark:text-indigo-400',   ring: 'ring-indigo-500/20' },
  sky:     { bg: 'from-sky-500 to-sky-600',         soft: 'bg-sky-50 dark:bg-sky-500/10',         text: 'text-sky-600 dark:text-sky-400',         ring: 'ring-sky-500/20' },
  violet:  { bg: 'from-violet-500 to-violet-600',   soft: 'bg-violet-50 dark:bg-violet-500/10',   text: 'text-violet-600 dark:text-violet-400',   ring: 'ring-violet-500/20' },
  emerald: { bg: 'from-emerald-500 to-emerald-600', soft: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-500/20' },
  amber:   { bg: 'from-amber-500 to-amber-600',     soft: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-600 dark:text-amber-400',     ring: 'ring-amber-500/20' },
  blue:    { bg: 'from-blue-500 to-blue-600',       soft: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-600 dark:text-blue-400',       ring: 'ring-blue-500/20' },
  rose:    { bg: 'from-rose-500 to-rose-600',       soft: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-600 dark:text-rose-400',       ring: 'ring-rose-500/20' },
  fuchsia: { bg: 'from-fuchsia-500 to-fuchsia-600', soft: 'bg-fuchsia-50 dark:bg-fuchsia-500/10', text: 'text-fuchsia-600 dark:text-fuchsia-400', ring: 'ring-fuchsia-500/20' },
};

function AnimatedNumber({ value = 0, duration = 900 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    let raf;
    const start = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

function StatCard({ title, value, icon: Icon, theme = 'indigo', hint }) {
  const t = CARD_THEMES[theme] || CARD_THEMES.indigo;
  return (
    <div className="relative bg-white/80 dark:bg-slate-950/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all group cursor-default hover:-translate-y-1 overflow-hidden">
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${t.bg} opacity-[0.08] blur-2xl group-hover:opacity-20 transition-opacity`} />
      <div className="flex items-start justify-between mb-6 relative">
        <div>
          <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            {title}
          </div>
          {hint && (
            <div className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md ${t.soft} ${t.text}`}>
              {hint}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.bg} text-white flex items-center justify-center shadow-lg ring-4 ${t.ring} group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
      <div className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums relative">
        <AnimatedNumber value={value} />
      </div>
    </div>
  );
}

function ProgressBar({ label, value, total, color = 'indigo', icon: Icon }) {
  const t = CARD_THEMES[color] || CARD_THEMES.indigo;
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`w-7 h-7 rounded-lg ${t.soft} ${t.text} flex items-center justify-center`}>
              <Icon size={14} strokeWidth={2.2} />
            </div>
          )}
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{Number(value).toLocaleString()}</span>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">{pct}%</span>
        </div>
      </div>
      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${t.bg} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function DonutChart({ segments = [], total = 0, centerLabel = 'Total' }) {
  const size = 180;
  const stroke = 22;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const safeTotal = segments.reduce((s, seg) => s + (seg.value || 0), 0) || 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-100 dark:stroke-slate-800"
          strokeWidth={stroke}
          fill="none"
        />
        {safeTotal > 0 &&
          segments.map((seg, i) => {
            const val = seg.value || 0;
            const dash = (val / safeTotal) * circumference;
            const el = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={seg.color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                style={{ transition: 'stroke-dasharray 700ms ease' }}
              />
            );
            offset += dash;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
          {Number(total).toLocaleString()}
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">
          {centerLabel}
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ title, icon: Icon, total, items, chartSegments }) {
  return (
    <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-sm">
            <Icon size={20} strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live status distribution</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <DonutChart segments={chartSegments} total={total} centerLabel="Total" />
        </div>
        <div className="space-y-5">
          {items.map((it, i) => (
            <ProgressBar
              key={i}
              label={it.label}
              value={it.value}
              total={total}
              color={it.color}
              icon={it.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await axios.get('/api/dashboard/', {
        timeout: 12000,
        // Force JSON and bypass any stale cached HTML response
        responseType: 'json',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        params: { _ts: Date.now() },
      });

      let payload = res.data;
      // If a proxy/cache returned HTML, axios may hand back a string
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch {
          setError('Server returned non-JSON response (likely a stale cached page). Hard-reload the page (Ctrl+Shift+R) to clear it.');
          return;
        }
      }

      if (payload?.status) {
        setData(payload.data || {});
        setError(null);
      } else {
        setError(payload?.message || 'Failed to load dashboard.');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      const code = err?.code;
      if (code === 'ECONNABORTED' || /timeout/i.test(err?.message || '')) {
        setError('Request timed out. The backend server is not responding. Please check your network / VPN, or contact the backend team.');
      } else if (err?.response?.status) {
        setError(`Server returned ${err.response.status}: ${err.response.statusText || 'Error'}`);
      } else {
        setError('Unable to reach dashboard API. The backend host is unreachable from your network.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const d = data || {};
  const totalTask = Number(d.total_task) || 0;
  const totalPrint = Number(d.total_print) || 0;

  const taskItems = [
    { label: 'Pending',     value: Number(d.pending_task) || 0,    color: 'amber',   icon: Hourglass },
    { label: 'In Progress', value: Number(d.inprogress_task) || 0, color: 'blue',    icon: Loader2 },
    { label: 'Completed',   value: Number(d.completed_task) || 0,  color: 'emerald', icon: CheckCircle2 },
  ];
  const taskSegments = [
    { value: Number(d.pending_task) || 0,    color: '#f59e0b' },
    { value: Number(d.inprogress_task) || 0, color: '#3b82f6' },
    { value: Number(d.completed_task) || 0,  color: '#10b981' },
  ];

  const printItems = [
    { label: 'Pending',   value: Number(d.pending_print) || 0,   color: 'amber',   icon: Hourglass },
    { label: 'Rejected',  value: Number(d.rejected_print) || 0,  color: 'rose',    icon: XCircle },
    { label: 'Completed', value: Number(d.completed_print) || 0, color: 'emerald', icon: CheckCheck },
  ];
  const printSegments = [
    { value: Number(d.pending_print) || 0,   color: '#f59e0b' },
    { value: Number(d.rejected_print) || 0,  color: '#f43f5e' },
    { value: Number(d.completed_print) || 0, color: '#10b981' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-wrap gap-4 justify-between items-end mb-8 relative">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Workspace Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[15px]">
            Here's what's happening in your CRM today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboard({ silent: true })}
            disabled={refreshing || loading}
            className="text-sm font-semibold px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-2 shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="text-sm font-semibold px-4 py-2 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20 flex items-center shadow-sm backdrop-blur-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
            System Online
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && !loading && (
        <div className="mb-8 flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
          <AlertCircle size={18} />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex-1 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-16 flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 size={40} className="animate-spin text-indigo-500 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-semibold">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Top stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-8">
            <StatCard title="Total Users"     value={d.total_user}     icon={Users}         theme="indigo"  hint="All accounts" />
            <StatCard title="Total Dealers"   value={d.total_dealer}   icon={Store}         theme="violet"  hint="Active" />
            <StatCard title="Total Employees" value={d.total_employee} icon={UserCog}       theme="sky"     hint="Team" />
            <StatCard title="Total Tasks"     value={d.total_task}     icon={ClipboardList} theme="emerald" hint="All time" />
            <StatCard title="Total Prints"    value={d.total_print}    icon={Printer}       theme="fuchsia" hint="All time" />
          </div>

          {/* Breakdown grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <BreakdownCard
              title="Task Breakdown"
              icon={ClipboardList}
              total={totalTask}
              items={taskItems}
              chartSegments={taskSegments}
            />
            <BreakdownCard
              title="Print Breakdown"
              icon={Printer}
              total={totalPrint}
              items={printItems}
              chartSegments={printSegments}
            />
          </div>

          {/* Highlights strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Hourglass size={20} />
                </div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-90">Pending Tasks</div>
              </div>
              <div className="text-4xl font-extrabold tabular-nums">
                <AnimatedNumber value={d.pending_task} />
              </div>
              <div className="text-xs font-semibold opacity-80 mt-1">Awaiting action</div>
            </div>

            <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 size={20} />
                </div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-90">In Progress</div>
              </div>
              <div className="text-4xl font-extrabold tabular-nums">
                <AnimatedNumber value={d.inprogress_task} />
              </div>
              <div className="text-xs font-semibold opacity-80 mt-1">Currently being worked on</div>
            </div>

            <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg">
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp size={20} />
                </div>
                <div className="text-sm font-bold uppercase tracking-wider opacity-90">Completed Prints</div>
              </div>
              <div className="text-4xl font-extrabold tabular-nums">
                <AnimatedNumber value={d.completed_print} />
              </div>
              <div className="text-xs font-semibold opacity-80 mt-1">Successfully processed</div>
            </div>
          </div>

          {/* Footer info panel */}
          <div className="flex-1 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 flex flex-col items-center justify-center min-h-[220px]">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-sm rotate-3">
                <LayoutDashboard size={40} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Premium Interface Enabled</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[14px]">
                Use the Sidebar navigation to access exactly the modules configured from the legacy system.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
