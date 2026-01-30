import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// =========================
// Basic routes
// =========================
app.get("/", (req, res) => {
  res.json({ ok: true, message: "CRM API running" });
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// =========================
// Models
// =========================

// Lead schema/model
const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    business: { type: String, default: "", trim: true },
    message: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
    },
    source: { type: String, default: "website", trim: true },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", LeadSchema);

// Client schema/model
const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    business: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    source: { type: String, default: "converted", trim: true },
    sourceLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", ClientSchema);

// Activity schema/model (NEW)
const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["lead_created", "status_updated", "lead_converted", "lead_deleted"],
      required: true,
    },
    message: { type: String, required: true, trim: true },

    // Optional references (nice for future “click to view”)
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },

    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", ActivitySchema);

// Helper: never break main requests if logging fails
async function logActivity(payload) {
  try {
    await Activity.create(payload);
  } catch (err) {
    console.error("⚠️ Activity log failed:", err?.message || err);
  }
}

// =========================
// Routes
// =========================

// Create lead
app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, business = "", message = "", source = "website" } =
      req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const lead = await Lead.create({
      name,
      email,
      business,
      message,
      status: "new",
      source,
    });

    await logActivity({
      type: "lead_created",
      message: `Lead created: ${lead.name}`,
      leadId: lead._id,
      meta: { email: lead.email, business: lead.business, source: lead.source },
    });

    res.status(201).json(lead);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// List leads
app.get("/api/leads", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).limit(200);
    res.json(leads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Update lead status
app.patch("/api/leads/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["new", "contacted", "qualified", "closed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const existing = await Lead.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Lead not found" });

    const prevStatus = existing.status;
    existing.status = status;
    const updated = await existing.save();

    await logActivity({
      type: "status_updated",
      message: `Status updated: ${updated.name} (${prevStatus} → ${updated.status})`,
      leadId: updated._id,
      meta: { from: prevStatus, to: updated.status },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Delete lead
app.delete("/api/leads/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    await Lead.findByIdAndDelete(req.params.id);

    await logActivity({
      type: "lead_deleted",
      message: `Lead deleted: ${lead.name}`,
      meta: { email: lead.email },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// List clients
app.get("/api/clients", async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 }).limit(200);
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// Convert lead → client
app.post("/api/leads/:id/convert", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    // If already converted, return existing client
    const existing = await Client.findOne({ sourceLeadId: lead._id });
    if (existing) {
      if (lead.status !== "closed") {
        lead.status = "closed";
        await lead.save();
      }

      return res.json({ ok: true, client: existing, alreadyConverted: true });
    }

    const client = await Client.create({
      name: lead.business || lead.name,
      email: lead.email,
      business: lead.business || "",
      notes: lead.message || "",
      source: lead.source,
      sourceLeadId: lead._id,
    });

    lead.status = "closed";
    await lead.save();

    await logActivity({
      type: "lead_converted",
      message: `Lead converted: ${lead.name} → Client`,
      leadId: lead._id,
      clientId: client._id,
      meta: { business: lead.business || "", source: lead.source },
    });

    res.status(201).json({ ok: true, client });
  } catch (err) {
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ error: "This lead was already converted." });
    }

    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// =========================
// Dashboard stats
// =========================
app.get("/api/stats", async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const totalClients = await Client.countDocuments();

    const leadsByStatusAgg = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusMap = leadsByStatusAgg.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      totalLeads,
      totalClients,
      conversionRate:
        totalLeads === 0 ? 0 : Math.round((totalClients / totalLeads) * 100),
      leadsByStatus: {
        new: statusMap.new || 0,
        contacted: statusMap.contacted || 0,
        qualified: statusMap.qualified || 0,
        closed: statusMap.closed || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// =========================
// Activity feed endpoint (NEW)
// =========================
app.get("/api/activity", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "40", 10), 100);
    const items = await Activity.find().sort({ createdAt: -1 }).limit(limit);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load activity" });
  }
});

// =========================
// Start server
// =========================
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Missing MONGODB_URI");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
