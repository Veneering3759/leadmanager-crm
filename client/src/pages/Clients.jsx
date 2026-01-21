console.log("VITE_API_URL (prod) =", import.meta.env.VITE_API_URL);

import { useEffect, useState } from "react";

const Badge = ({ children }) => (
  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
    {children}
  </span>
);

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
  try {
    setLoading(true);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clients`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    setClients(data);
  } catch (err) {
    console.error("Failed to load clients:", err);
    setClients([]); // optional
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="text-slate-500">Loading clients...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">
            Converted leads show up here.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c._id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.email}</td>
                <td className="px-4 py-3">
                  <Badge>{c.business || "—"}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{c.notes || "—"}</td>
              </tr>
            ))}

            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No clients yet — convert a lead to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
