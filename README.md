# LeadManager CRM

A production-ready, full-stack CRM built to demonstrate clean UI patterns, REST API design, and real-world cloud deployment workflows.

**Live Demo:** https://crm-dashboard-navy.vercel.app  
**Frontend:** React (Vite) + Tailwind  
**Backend:** Node.js + Express + MongoDB (Mongoose)  
**Deploy:** Vercel (frontend) + Render (API)

---

## Why this project exists

Many small teams still manage leads in spreadsheets or inboxes, which leads to missed follow-ups, lost context, and unclear pipelines.

LeadManager addresses that by providing a lightweight CRM experience:
- A centralized lead dashboard
- Clear status workflows
- Fast search & filtering
- One-click lead → client conversion

Built to reflect realistic UI + API patterns without enterprise bloat.

---

## Core features

- Lead CRUD with validation (name + email required)
- Search + filtering (name, email, business)
- Pipeline status workflow: **new → contacted → qualified → closed**
- Convert leads into clients (audit-friendly conversion behavior)
- Delete confirmation modal (prevents accidental destructive actions)
- Responsive UI: mobile cards + desktop tables
- Live backend connectivity checks (**/healthz**, **/api/stats**) inside Settings

---

## API endpoints

**Leads**
- `POST /api/leads`
- `GET /api/leads`
- `PATCH /api/leads/:id/status`
- `DELETE /api/leads/:id`
- `POST /api/leads/:id/convert`

**Dashboard**
- `GET /api/stats`

**Clients**
- `GET /api/clients`

---

## Tech stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Component-based UI
- Centralized API helper for environment-based configuration

**Backend**
- Node.js + Express
- REST API design
- MongoDB Atlas
- Mongoose models

**Deployment**
- Vercel (frontend)
- Render (backend — may cold start on first request)

---

## What this demonstrates

- Production UI patterns (modals, inline editing, badges, empty states)
- Clean REST API design with predictable responses
- Environment-based configuration (Vercel env var wiring)
- Real deployment workflows (Render + Vercel integration)

---

## Notes

Render may cold start on the first request. Subsequent requests are fast.

---

## License

MIT
