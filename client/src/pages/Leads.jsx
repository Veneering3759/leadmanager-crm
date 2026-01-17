import { useEffect, useMemo, useState } from "react";

const STATUS = ["all", "new", "contacted", "qualified", "closed"];

const Badge = ({ children }) => (
  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
    {children}
  </span>
);

function getApiBase() {
  // You can set VITE_API_URL as:
  // 1) https://crm-dashboard-olqp.onrender.com
  // OR
  // 2) https://crm-dashboard-olqp.onrender.com/api
  //
  // This function normalizes so we ALWAYS end up with ".../api"
  const raw = (import.meta.env.VITE_API_URL || "").trim();

  // Local dev fallback (optional, but helpful)
  const fallback = "http://localhost:5000/api";

  const base = (raw || fallback).replace(/\/+$/, ""); // remove trailing slashes
  return base.endsWith("/api") ? base : `${base}/api`;
}

async function jsonOrThrow(res) {
  if (res.ok) return res.json();
  const text = await res.text().catch(() => "");
  throw new Error(text || `Request failed (${res.status})`);
}

export default function Leads() {
  const API = getApiBase();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [viewLead, setViewLead] = useState(null);

  async function loadLeads() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/leads`);
      const fresh = await jsonOrThrow(res);
      setLeads(Array.isArray(fresh) ? fresh : []);
    } catch (err) {
      console.error("Load leads failed:", err);
      alert("Failed to load leads from server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return leads.filter((row) => {
      const matchesQuery =
        !q ||
        (row.name || "").toLowerCase().includes(q) ||
        (row.email || "").toLowerCase().includes(q);

      const matchesStatus = status === "all" || row.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [query, status, leads]);

  async function updateLeadStatus(id, nextStatus) {
    const res = await fetch(`${API}/leads/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    const updated = await jsonOrThrow(res);
    setLeads((prev) => prev.map((l) => (l._id === id ? updated : l)));
  }

  async function convertLead(id) {
    const res = await fetch(`${API}/leads/${id}/convert`, { method: "POST" });
    await jsonOrThrow(res);

    // refresh list
    const res2 = await fetch(`${API}/leads`);
    const fresh = await jsonOrThrow(res2);
    setLeads(Array.isArray(fresh) ? fresh : []);
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
        <p className="text-sm text-slate-500">Loading leads…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-500">
            Search + filters = instant “this is real” feeling.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 sm:w-64"
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

          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            + Add Lead
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
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
              <tr key={row._id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {row.name}
                </td>
                <td className="px-4 py-3 text-slate-600">{row.email}</td>

                <td className="px-4 py-3">
                  <Badge>{row.status}</Badge>
                </td>

                <td className="px-4 py-3">
                  <Badge>{row.source || "website"}</Badge>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={row.status}
                      onChange={async (e) => {
                        const nextStatus = e.target.value;
                        try {
                          await updateLeadStatus(row._id, nextStatus);
                        } catch (err) {
                          console.error(err);
                          alert("Could not update status.");
                        }
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-sm"
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="qualified">qualified</option>
                      <option value="closed">closed</option>
                    </select>

                    <button
                      onClick={() => setViewLead(row)}
                      className="rounded-xl border border-slate-200 px-3 py-1 hover:bg-slate-50"
                    >
                      View
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          await convertLead(row._id);
                        } catch (err) {
                          console.error(err);
                          alert("Convert failed.");
                        }
                      }}
                      className="rounded-xl bg-slate-900 px-3 py-1 text-white"
                    >
                      Convert
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{viewLead.name}</h2>
                <p className="text-sm text-slate-500">{viewLead.email}</p>
              </div>

              <button
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                onClick={() => setViewLead(null)}
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
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
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                  {viewLead.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
