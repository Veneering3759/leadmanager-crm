import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import TableSkeleton from "../components/TableSkeleton";
import ErrorBanner from "../components/ErrorBanner";
import LeadFormModal from "../components/LeadFormModal";
import ConfirmModal from "../components/ConfirmModal";

const STATUS = ["all", "new", "contacted", "qualified", "closed"];

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

function SourcePill({ source }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
      {source || "website"}
    </span>
  );
}

export default function Leads() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [viewLead, setViewLead] = useState(null);

  const [addOpen, setAddOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadLeads() {
    try {
      setError("");
      setLoading(true);
      const fresh = await apiFetch("/api/leads");
      setLeads(Array.isArray(fresh) ? fresh : []);
    } catch (err) {
      console.error(err);
      setLeads([]);
      setError(err?.message || "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return leads.filter((row) => {
      const matchesQuery =
        !q ||
        (row.name || "").toLowerCase().includes(q) ||
        (row.email || "").toLowerCase().includes(q) ||
        (row.business || "").toLowerCase().includes(q);

      const matchesStatus = status === "all" || row.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [query, status, leads]);

  async function updateLeadStatus(id, nextStatus) {
    const updated = await apiFetch(`/api/leads/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });

    setLeads((prev) => prev.map((l) => (l._id === id ? updated : l)));
  }

  async function convertLead(id) {
    await apiFetch(`/api/leads/${id}/convert`, { method: "POST" });
    await loadLeads();
  }

  async function deleteLead(id) {
    try {
      setDeleting(true);
      await apiFetch(`/api/leads/${id}`, { method: "DELETE" });
      setDeleteTarget(null);
      await loadLeads();
    } catch (err) {
      console.error(err);
      alert(err?.message || "Failed to delete lead");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">Loading leads…</p>
        </div>

        <TableSkeleton
          rows={8}
          columns={[
            { label: "Name", width: "w-32" },
            { label: "Email", width: "w-48" },
            { label: "Status", width: "w-24" },
            { label: "Source", width: "w-28" },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track prospects, update pipeline status, and convert to clients.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or business…"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 sm:w-72"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={loadLeads}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Refresh
          </button>

          <button
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            onClick={() => setAddOpen(true)}
          >
            + Add Lead
          </button>
        </div>
      </div>

      {error && (
        <ErrorBanner
          title="Couldn’t load leads"
          message={error}
          onRetry={loadLeads}
        />
      )}

      {/* =============== */}
      {/* MOBILE: Cards   */}
      {/* =============== */}
      <div className="grid gap-3 md:hidden">
        {!error && filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
            No leads found.
          </div>
        ) : (
          filtered.map((row) => (
            <div
              key={row._id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">
                    {row.name}
                  </div>
                  <div className="truncate text-sm text-slate-600">
                    {row.email}
                  </div>
                  {row.business ? (
                    <div className="mt-1 truncate text-xs text-slate-500">
                      {row.business}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <StatusPill status={row.status} />
                  <SourcePill source={row.source} />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <select
                  value={row.status}
                  onChange={async (e) => {
                    const nextStatus = e.target.value;
                    try {
                      await updateLeadStatus(row._id, nextStatus);
                    } catch (err) {
                      console.error(err);
                      alert(`Could not update status.\n\n${err.message}`);
                    }
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <option value="new">new</option>
                  <option value="contacted">contacted</option>
                  <option value="qualified">qualified</option>
                  <option value="closed">closed</option>
                </select>

                <button
                  onClick={() => setViewLead(row)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                >
                  View
                </button>

                <button
                  onClick={async () => {
                    try {
                      await convertLead(row._id);
                    } catch (err) {
                      console.error(err);
                      alert(`Convert failed.\n\n${err.message}`);
                    }
                  }}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
                >
                  Convert
                </button>

                <button
                  onClick={() => setDeleteTarget(row)}
                  disabled={deleting}
                  className="rounded-xl border border-rose-300 bg-rose-100 px-3 py-2 text-sm text-rose-800 hover:bg-rose-200 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= */}
      {/* DESKTOP: Table    */}
      {/* ================= */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((row) => (
              <tr
                key={row._id}
                className="border-t border-slate-200 hover:bg-slate-50/40"
              >
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{row.name}</div>
                  {row.business ? (
                    <div className="text-xs text-slate-500">{row.business}</div>
                  ) : null}
                </td>

                <td className="px-4 py-3 text-slate-600">{row.email}</td>

                <td className="px-4 py-3">
                  <StatusPill status={row.status} />
                </td>

                <td className="px-4 py-3">
                  <SourcePill source={row.source} />
                </td>

                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <select
                      value={row.status}
                      onChange={async (e) => {
                        const nextStatus = e.target.value;
                        try {
                          await updateLeadStatus(row._id, nextStatus);
                        } catch (err) {
                          console.error(err);
                          alert(`Could not update status.\n\n${err.message}`);
                        }
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm"
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="qualified">qualified</option>
                      <option value="closed">closed</option>
                    </select>

                    <button
                      onClick={() => setViewLead(row)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 hover:bg-white"
                    >
                      View
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          await convertLead(row._id);
                        } catch (err) {
                          console.error(err);
                          alert(`Convert failed.\n\n${err.message}`);
                        }
                      }}
                      className="rounded-xl bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-800"
                    >
                      Convert
                    </button>

                    <button
                      onClick={() => setDeleteTarget(row)}
                      disabled={deleting}
                      className="rounded-xl border border-rose-300 bg-rose-100 px-3 py-1.5 text-rose-800 hover:bg-rose-200 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!error && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View modal */}
      {viewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold">{viewLead.name}</h2>
                <p className="truncate text-sm text-slate-500">{viewLead.email}</p>
              </div>

              <button
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                onClick={() => setViewLead(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-slate-500">Business</div>
                <div className="font-medium">{viewLead.business || "—"}</div>
              </div>

              <div>
                <div className="text-slate-500">Message</div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {viewLead.message || "—"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">Status:</span>
                <StatusPill status={viewLead.status} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add lead */}
      <LeadFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={loadLeads}
      />

      {/* Confirm delete */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete lead?"
        message={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteLead(deleteTarget._id)}
      />
    </div>
  );
}
