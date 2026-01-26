import { apiUrl } from "../lib/api";

import { useState } from "react";
import { Link } from "react-router-dom";

const Feature = ({ title, desc }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="text-sm font-semibold text-slate-900">{title}</div>
    <div className="mt-1 text-sm text-slate-600">{desc}</div>
  </div>
);

export default function Landing() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    business: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(apiUrl("/api/leads"), {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      throw new Error("Failed to submit");
    }

    setSent(true);
    setForm({ name: "", email: "", business: "", message: "" });
    setTimeout(() => setSent(false), 2500);
  } catch (err) {
    alert("Something went wrong. Try again.");
    console.error(err);
  }
};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="text-base font-semibold text-slate-900">
            LeadManager
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Open app
            </Link>
            <a
              href="#demo"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Request demo
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Track leads → convert clients → grow revenue
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              A mini CRM that makes small businesses feel organized.
            </h1>

            <p className="mt-4 max-w-xl text-base text-slate-600">
              Capture leads from your website, manage follow-ups, and convert
              customers — with a clean dashboard that looks like a real product.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#demo"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Request a demo
              </a>
              <Link
                to="/app"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View dashboard
              </Link>
            </div>

            <div className="mt-6 text-xs text-slate-500">
              Perfect for agencies, consultants, clinics, trades, and local
              service businesses.
            </div>
          </div>

          {/* Mock card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  This week
                </div>
                <div className="text-xs text-slate-500">Pipeline snapshot</div>
              </div>
              <div className="h-9 w-9 rounded-2xl bg-slate-900" />
            </div>

            <div className="mt-4 grid gap-3">
              {[
                ["New leads", "12"],
                ["Qualified", "6"],
                ["Active clients", "7"],
                ["Revenue", "$1,250"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div className="text-sm text-slate-600">{k}</div>
                  <div className="text-sm font-semibold text-slate-900">{v}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-medium text-slate-700">
                “We follow up faster now.”
              </div>
              <div className="mt-1 text-xs text-slate-500">
                — Demo testimonial (good for portfolio)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature
            title="Lead capture"
            desc="Website form sends leads into your dashboard."
          />
          <Feature
            title="Pipeline tracking"
            desc="Statuses + search + filters keep everything clear."
          />
          <Feature
            title="Convert to clients"
            desc="Turn qualified leads into clients with one click."
          />
        </div>
      </section>

      {/* Demo form */}
      <section id="demo" className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Request a demo
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Tell us a bit about your business. We’ll reply with a demo link.
              (For now this is a portfolio form — next we connect it to the API.)
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">
                What clients love
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                <li>Simple setup</li>
                <li>Clean dashboard UI</li>
                <li>Lead follow-up workflow</li>
              </ul>
            </div>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {sent && (
              <div className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Request sent ✅ (we’ll wire it to the backend next)
              </div>
            )}

            <div className="grid gap-3">
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                required
              />
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="Email"
                type="email"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                required
              />
              <input
                name="business"
                value={form.business}
                onChange={onChange}
                placeholder="Business / company"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                placeholder="What do you want to track? (leads, clients, follow-ups...)"
                rows={4}
                className="resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
              <button className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800">
                Send request
              </button>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              You can say: “I built the marketing site + dashboard + lead capture
              flow.”
            </div>
          </form>
        </div>
      </section>

      <footer className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs text-slate-500">
          © {new Date().getFullYear()} DANIEL ARYEE — LeadManager (Portfolio project)

        </div>
      </footer>
    </div>
  );
}
