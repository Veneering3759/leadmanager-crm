import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { Link } from "react-router-dom";

function Badge({ tone = "slate", children }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    blue: "bg-sky-50 text-sky-700 ring-sky-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        tones[tone] || tones.slate
      }`}
    >
      {children}
    </span>
  );
}

function Card({ title, subtitle, children, right }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="mt-4">{children}</div>
    </div>
  );
}

function Row({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="text-sm text-slate-500">{label}</div>
      <div
        className={`min-w-0 text-right text-sm font-medium text-slate-900 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        <span className="break-all">{value}</span>
      </div>
    </div>
  );
}

function LinkCard({ title, subtitle, href, to, external = false }) {
  const common =
    "group rounded-2xl border border-slate-200 bg-white p-4 text-left hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-300";
  const titleCls =
    "text-sm font-semibold text-slate-900 group-hover:text-slate-950";
  const subCls = "mt-1 text-xs text-slate-500";

  if (to) {
    return (
      <Link to={to} className={common}>
        <div className={titleCls}>{title}</div>
        <div className={subCls}>{subtitle}</div>
      </Link>
    );
  }

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={common}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={titleCls}>{title}</div>
          <div className={subCls}>{subtitle}</div>
        </div>

        {/* subtle external indicator */}
        {external ? (
          <span className="mt-0.5 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
            opens
          </span>
        ) : null}
      </div>
    </a>
  );
}

export default function Settings() {
  const [checking, setChecking] = useState(true);
  const [health, setHealth] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const apiBase = useMemo(() => {
    // Vite env is compiled at build time, so safe to read directly
    return import.meta.env.VITE_API_URL || "";
  }, []);

  async function runChecks() {
    try {
      setError("");
      setChecking(true);

      const h = await apiFetch("/healthz");
      setHealth(h);

      const s = await apiFetch("/api/stats");
      setStats(s);
    } catch (e) {
      setHealth(null);
      setStats(null);
      setError(e?.message || "Health check failed");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    runChecks();
  }, []);

  const statusTone = !apiBase
    ? "amber"
    : error
    ? "red"
    : checking
    ? "blue"
    : "green";

  const statusText = !apiBase
    ? "Missing VITE_API_URL"
    : error
    ? "Backend unreachable"
    : checking
    ? "Checking…"
    : "Connected";

  const snapshotText = stats
    ? `Leads: ${stats.totalLeads}, Clients: ${stats.totalClients}, Conversion: ${stats.conversionRate}%`
    : "—";

  // Update these once and you're done (no more “Replace this link”)
  const LINKS = {
    marketing: "/", // internal route
    dashboard: "/app", // internal route
    github: "https://github.com/Veneering3759/leadmanager-crm",
    linkedin: "https://www.linkedin.com/in/daniel-a-869619399/",
  };

  return (
    <div className="min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Environment checks, project links, and a concise product brief.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone={statusTone}>{statusText}</Badge>
          <button
            onClick={runChecks}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Re-check
          </button>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <div className="font-semibold">Connection problem</div>
          <div className="mt-1 opacity-90">{error}</div>
          <div className="mt-3 text-xs text-rose-700">
            Tip: confirm your Vercel env var <b>VITE_API_URL</b> matches your
            Render service URL (no trailing slash).
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Connection */}
        <Card
          title="Backend connection"
          subtitle="Live health check + database-backed stats."
          right={
            checking ? (
              <Badge tone="blue">Running…</Badge>
            ) : error ? (
              <Badge tone="red">Failed</Badge>
            ) : (
              <Badge tone="green">OK</Badge>
            )
          }
        >
          <div className="divide-y divide-slate-100">
            <Row label="API base URL" value={apiBase || "—"} mono />
            <Row
              label="Health endpoint"
              value={health ? JSON.stringify(health) : "—"}
              mono
            />
            <Row label="Stats snapshot" value={snapshotText} />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-semibold text-slate-900">Portfolio note</div>
              <Badge tone="slate">Read-only setup</Badge>
            </div>
            <div className="mt-1 text-slate-600">
              This instance is deployed to demonstrate a realistic full-stack
              workflow: API wiring, data modeling, and a production UI pattern.
            </div>
          </div>
        </Card>

        {/* Project links */}
        <Card
          title="Project links"
          subtitle="One-click navigation for recruiters."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <LinkCard
              title="Marketing site"
              subtitle="Portfolio landing page"
              to={LINKS.marketing}
            />
            <LinkCard
              title="Dashboard"
              subtitle="Live app experience"
              to={LINKS.dashboard}
            />
            <LinkCard
              title="GitHub repository"
              subtitle="Source code + setup instructions"
              href={LINKS.github}
              external
            />
            <LinkCard
              title="LinkedIn"
              subtitle="Professional profile"
              href={LINKS.linkedin}
              external
            />
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-semibold text-slate-900">Recruiter note</div>
            <div className="mt-1 text-slate-600">
              LeadManager is a production-style mini CRM built to demonstrate
              clean UI architecture, REST API design, and real deployment
              workflows (Vercel + Render). Key flows include lead CRUD, pipeline
              status updates, and lead → client conversion with live metrics.
            </div>
          </div>
        </Card>

        {/* Tech stack */}
        <Card title="Tech stack" subtitle="At-a-glance snapshot.">
          <div className="flex flex-wrap gap-2">
            <Badge tone="slate">React</Badge>
            <Badge tone="slate">Vite</Badge>
            <Badge tone="slate">Tailwind</Badge>
            <Badge tone="slate">Node.js</Badge>
            <Badge tone="slate">Express</Badge>
            <Badge tone="slate">MongoDB</Badge>
            <Badge tone="slate">Render</Badge>
            <Badge tone="slate">Vercel</Badge>
          </div>

          <div className="mt-4 text-sm text-slate-600">
            <div className="font-semibold text-slate-900">Highlights</div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Full CRUD flows + conversion (lead → client)</li>
              <li>Dashboard metrics (stats endpoint)</li>
              <li>Responsive UI (desktop table + mobile cards)</li>
              <li>Production deployments (Render + Vercel env wiring)</li>
            </ul>
          </div>
        </Card>

        {/* Roadmap */}
        <Card
          title="Roadmap"
          subtitle="High-impact additions that keep scope sane."
        >
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Badge tone="green">Next</Badge>
              <div>
                <div className="font-semibold text-slate-900">Activity feed</div>
                <div className="text-slate-600">
                  Log events like “status updated”, “lead converted”, “lead
                  deleted”, and show a timeline on the dashboard.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge tone="amber">Soon</Badge>
              <div>
                <div className="font-semibold text-slate-900">Pipeline view</div>
                <div className="text-slate-600">
                  Kanban board for leads (drag & drop stages).
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge tone="slate">Later</Badge>
              <div>
                <div className="font-semibold text-slate-900">Auth</div>
                <div className="text-slate-600">
                  User accounts + authorization to protect data access.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
