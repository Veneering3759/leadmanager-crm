import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function LeadFormModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    business: "",
    message: "",
    source: "website",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    try {
      setError("");
      setSaving(true);

      await apiFetch("/api/leads", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm({
        name: "",
        email: "",
        business: "",
        message: "",
        source: "website",
      });

      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to add lead.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add lead</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a new lead to your pipeline.
            </p>
          </div>

          <button
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-60"
            onClick={onClose}
            disabled={saving}
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-slate-600">
                Name *
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                placeholder="Jane Doe"
                required
                disabled={saving}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-slate-600">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                placeholder="jane@company.com"
                required
                disabled={saving}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">
                Business
              </label>
              <input
                name="business"
                value={form.business}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                placeholder="Company name"
                disabled={saving}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                rows={4}
                className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                placeholder="What are they asking for?"
                disabled={saving}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600">
                Source
              </label>
              <select
                name="source"
                value={form.source}
                onChange={onChange}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                disabled={saving}
              >
                <option value="website">website</option>
                <option value="referral">referral</option>
                <option value="instagram">instagram</option>
                <option value="linkedin">linkedin</option>
                <option value="cold-email">cold-email</option>
                <option value="other">other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Add lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
