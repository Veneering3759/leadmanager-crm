import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import TableSkeleton from "../components/TableSkeleton";
import ErrorBanner from "../components/ErrorBanner";

const SOURCE_FILTERS = ["all", "website", "referral", "converted", "other"];

function sourceBadgeClasses(source) {
  const s = (source || "").toLowerCase();

  // Subtle, professional tints
  if (s === "website")
    return "border-sky-200 bg-sky-50 text-sky-700";
  if (s === "referral")
    return "border-violet-200 bg-violet-50 text-violet-700";
  if (s === "converted")
    return "border-emerald-200 bg-emerald-50 text-emerald-700";

  return "border-slate-200 bg-slate-50 text-slate-700";
}

const Pill = ({ children, className = "" }) => (
  <span
    className={[
      "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
      className,
    ].join(" ")}
  >
    {children}
  </span>
);

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [viewClient, setViewClient] = useState(null);

  async function load() {
    try {
      setError("");
      setLoading(true);

      const data = await apiFetch("/api/clients");
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load clients:", err);
      setClients([]);
      setError(err?.message || "Failed to load clients.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ✅ Optional: dedupe UI by email (keeps table clean if DB has old duplicates)
  const deduped = useMemo(() => {
    const seen = new Set();
    const out = [];
    for (const c of clients) {
      const key = (c.email || "").trim().toLowerCase();
      if (!key) {
        out.push(c);
        continue;
      }
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
    return out;
  }, [clients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deduped.filter((c) => {
      const matchesQuery =
        !q ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q) ||
        (c.business || "").toLowerCase().includes(q) ||
        (c.notes || "").toLowerCase().includes(q);

      const s = (c.source || "").toLowerCase();
      const matchesSource =
        sourceFilter === "all" ||
        (sourceFilter === "other"
          ? s && !["website", "referral", "converted"].includes(s)
          : s === sourceFilter);

      return matchesQuery && matchesSource;
    });
  }, [deduped, query, sourceFilter]);

  if (loading) {
    return (
      <TableSkeleton
        rows={8}
        columns={[
          { label: "Client", width: "w-40" },
          { label: "Email", width: "w-56" },
          { label: "Business", width: "w-40" },
          { label: "Source", width: "w-24" },
          { label: "Notes", width: "w-64" },
          { label: "Actions", width: "w-24" },
        ]}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Converted leads live here — search, review, and follow up.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, business..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 sm:w-72"
          />

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            {SOURCE_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={load}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <ErrorBanner
          title="Couldn’t load clients"
          message={error}
          onRetry={load}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr
                key={c._id}
                className="border-t border-slate-200 hover:bg-slate-50/60"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">
                    {c.business || "—"}
                  </div>
                </td>

                <td className="px-4 py-3 text-slate-700">{c.email}</td>

                <td className="px-4 py-3">
                  <Pill className="border-slate-200 bg-slate-50 text-slate-700">
                    {c.business || "—"}
                  </Pill>
                </td>

                <td className="px-4 py-3">
                  <Pill className={sourceBadgeClasses(c.source)}>
                    {(c.source || "other").toLowerCase()}
                  </Pill>
                </td>

                <td className="px-4 py-3 text-slate-600">
                  <span className="line-clamp-2 block max-w-[420px]">
                    {c.notes || "—"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setViewClient(c)}
                      className="rounded-xl border border-slate-200 px-3 py-1 text-sm hover:bg-slate-50"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!error && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No clients yet — convert a lead to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View modal */}
      {viewClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {viewClient.name}
                </h2>
                <p className="text-sm text-slate-500">{viewClient.email}</p>
              </div>

              <button
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                onClick={() => setViewClient(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Pill className="border-slate-200 bg-slate-50 text-slate-700">
                  {viewClient.business || "—"}
                </Pill>
                <Pill className={sourceBadgeClasses(viewClient.source)}>
                  {(viewClient.source || "other").toLowerCase()}
                </Pill>
              </div>

              <div>
                <div className="text-slate-500">Notes</div>
                <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700">
                  {viewClient.notes || "—"}
                </div>
              </div>

              {viewClient.createdAt && (
                <div className="text-xs text-slate-500">
                  Added: {new Date(viewClient.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

