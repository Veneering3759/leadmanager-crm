import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Basic test route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "CRM API running" });
});

/* =========================
   Models
========================= */

// Lead schema/model
const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
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
    name: { type: String, required: true, trim: true }, // client/company name
    email: { type: String, required: true, trim: true },
    business: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    source: { type: String, default: "converted", trim: true },
    sourceLeadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
  },
  { timestamps: true }
);

const Client = mongoose.model("Client", ClientSchema);

/* =========================
   Routes
========================= */

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
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["new", "contacted", "qualified", "closed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updated = await Lead.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});
// Delete lead
app.delete("/api/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Lead.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Lead not found" });

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

// Convert lead -> client
app.post("/api/leads/:id/convert", async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id);
    if (!lead) return res.status(404).json({ error: "Lead not found" });

    // Prevent duplicate conversion
    const existing = await Client.findOne({ sourceLeadId: id });
    if (existing) {
      // Ensure lead is closed too
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
      source: lead.source || "converted",
      sourceLeadId: lead._id,
    });

    // Mark lead closed (keep it for history/pipeline)
    lead.status = "closed";
    await lead.save();

    res.status(201).json({ ok: true, client });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

/* =========================
   Start server
========================= */

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("Missing MONGODB_URI in server/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`✅ API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
