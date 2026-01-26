# LeadManager CRM

**LeadManager** is a full-stack CRM demo built by **DANIEL ARYEE**.  
It demonstrates real-world patterns for managing leads, converting them into clients, and handling production-ready UI states.

---

## 🚀 Live Demo
- Frontend: (add Vercel URL here)
- Backend API: (add Render URL here)

---

## ✨ Features

### Leads
- Create new leads
- Search and filter by status
- Update lead status (new → contacted → qualified → closed)
- Convert leads into clients
- Delete leads with confirmation

### Clients
- Automatically created from converted leads
- Read-only client list with notes and source tracking

### UI / UX
- Modal-based forms
- Confirmation dialogs for destructive actions
- Skeleton loaders while fetching data
- Graceful error handling and retry states

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Fetch API (centralized via `apiFetch`)

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- REST API

### Deployment
- Frontend: Vercel
- Backend: Render

---

## 🧠 Architecture Notes

- **Centralized API layer** (`apiFetch`) handles:
  - Base URL configuration
  - JSON parsing
  - Error handling
- UI state is kept local and explicit (loading, error, empty states)
- Modals are controlled via state (no global stores needed)
- Server follows REST conventions with clear routes

---

## 🛠️ Running Locally

### 1. Clone repo
```bash
git clone https://github.com/Veneering3759/crm-dashboard.git
cd crm-dashboard