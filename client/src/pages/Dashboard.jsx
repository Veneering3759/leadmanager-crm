import { apiUrl } from "../lib/api";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl("/api/leads"))

      .then((res) => res.json())
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch leads", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading leads...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-slate-500">{leads.length} leads in the system</p>

      <div className="mt-6 space-y-3">
        {leads.map((lead) => (
          <div
            key={lead._id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="font-medium">{lead.name}</div>
            <div className="text-sm text-slate-500">{lead.email}</div>
            <div className="text-sm text-slate-400">
              {lead.business || "No company"}
            </div>
            <div className="mt-2 text-xs uppercase text-emerald-600">
              {lead.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
