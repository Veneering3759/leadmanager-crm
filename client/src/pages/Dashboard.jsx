import { useEffect, useMemo, useState } from "react";
import { apiFetch, getStats } from "../lib/api";
import TableSkeleton from "../components/TableSkeleton";
import ErrorBanner from "../components/ErrorBanner";

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    new: "bg-sky-50 text-sky-700 ring-sky-200",
    contacted: "bg-amber-50 text-amber-700 ring-amber-200",
    qualified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    closed: "bg-slate-100 text-slate-700 ring-slate-200",
  };
  const cls = map[status] || "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {status}
    </span>
  );
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function ActivityIcon({ type }) {
  // Simple “SaaS-y” dots (no icon library needed)
  const tone =
    type === "lead_created"
      ? "bg-sky-500"
      : type === "lead_status_updated"
      ? "bg-amber-500"
      : type === "lead_converted"
      ? "bg-emerald-500"
      : type === "lead_deleted"
      ? "bg-rose-500"
      : "bg-slate-400";

  return <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${tone}`} />;
}

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingActivity, setCheckingActivity] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setError("");
      setLoading(true);

      const data = await apiFetch("/api/leads");
      setLeads(Array.isArray(data) ? data : []);

      const statsData = await getStats();
      setStats(statsData);

      setCheckingActivity(true);
      const a = await apiFetch("/api/activity");
      setActivity(Array.isArray(a) ? a : []);
    } catch (e) {
      setLeads([]);
      setStats(null);
      setActivity([]);
      setError(e?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setCheckingActivity(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const recentLeads = useMemo(() => leads.slice(0, 8), [leads]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-slate-500">Loading summary…</p>
          </div>
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            Refresh
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total leads" value="—" />
          <StatCard label="New" value="—" />
          <StatCard label="Qualified" value="—" />
          <StatCard label="Clients" value="—" />
          <StatCard label="Conversion" value="—" />
        </div>

        <TableSkeleton
          rows={6}
          columns={[
            { label: "Lead", width: "w-56" },
            { label: "Email", width: "w-64" },
            { label: "Company", width: "w-40" },
            { label: "Status", width: "w-24" },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-500">
            {stats?.totalLeads ?? leads.length} leads in the system
          </p>
        </div>

        <button
          onClick={load}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <ErrorBanner title="Couldn’t load dashboard" message={error} onRetry={load} />
      ) : null}

      {/* Stats */}
      {!error ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total leads"
            value={stats?.totalLeads ?? leads.length}
            hint="All time"
          />
          <StatCard
            label="New"
            value={stats?.leadsByStatus?.new ?? 0}
            hint="Need follow-up"
          />
          <StatCard
            label="Qualified"
            value={stats?.leadsByStatus?.qualified ?? 0}
            hint="High intent"
          />
          <StatCard
            label="Clients"
            value={stats?.totalClients ?? 0}
            hint="Converted"
          />
          <StatCard
            label="Conversion"
            value={`${stats?.conversionRate ?? 0}%`}
            hint="Leads → clients"
          />
        </div>
      ) : null}

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Recent leads */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Recent leads</div>
              <div className="text-xs text-slate-500">Latest 8 records</div>
            </div>
            <div className="text-xs text-slate-500">
              {stats?.totalLeads ?? leads.length} total
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3">Lead</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead._id} className="border-t border-slate-200">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {lead.name}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{lead.email}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {lead.business || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={lead.status} />
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                      No leads yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Activity</div>
              <div className="text-xs text-slate-500">
                Live event log (create → update → convert → delete)
              </div>
            </div>
            {checkingActivity ? (
              <span className="text-xs text-slate-500">Updating…</span>
            ) : null}
          </div>

          <div className="max-h-[520px] overflow-auto px-5 py-4">
            {activity.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                No activity yet. Add a lead or update a status to generate events.
              </div>
            ) : (
              <div className="space-y-4">
                {activity.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <ActivityIcon type={item.type} />
                      <div className="mt-2 h-full w-px bg-slate-200" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900">
                        {item.title}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {formatTime(item.createdAt)}
                      </div>

                      {item?.meta && Object.keys(item.meta || {}).length > 0 ? (
                        <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                          <pre className="whitespace-pre-wrap break-words">
                            {JSON.stringify(item.meta, null, 2)}
                          </pre>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
