import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import * as Campaign from "../models/Campaign.js";

// GET /api/campaigns
export async function getAllCampaigns(req, res, next) {
  try {
    const db = getDB();
    const filter = Campaign.buildFilter(req.query);
    const campaigns = await db
      .collection(Campaign.COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, count: campaigns.length, data: campaigns });
  } catch (err) {
    next(err);
  }
}

// GET /api/campaigns/:id
export async function getCampaignById(req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid campaign ID" });
    }

    const db = getDB();
    const campaign = await db
      .collection(Campaign.COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!campaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    res.json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
}

// POST /api/campaigns
export async function createCampaign(req, res, next) {
  try {
    const errors = Campaign.validate(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join("; ") });
    }

    const doc = Campaign.createCampaignDoc(req.body);
    const db = getDB();
    const result = await db.collection(Campaign.COLLECTION).insertOne(doc);

    res.status(201).json({ success: true, data: { _id: result.insertedId, ...doc } });
  } catch (err) {
    next(err);
  }
}

// PUT /api/campaigns/:id
export async function updateCampaign(req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid campaign ID" });
    }

    const errors = Campaign.validate(req.body, true);
    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join("; ") });
    }

    const updates = Campaign.buildUpdateDoc(req.body);
    if (Object.keys(updates).length === 1) {
      // only updatedAt was set — no actual fields provided
      return res.status(400).json({ success: false, message: "No valid fields provided for update" });
    }

    const db = getDB();
    const result = await db.collection(Campaign.COLLECTION).findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/campaigns/:id
export async function deleteCampaign(req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid campaign ID" });
    }

    const db = getDB();
    const result = await db
      .collection(Campaign.COLLECTION)
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    res.json({ success: true, message: "Campaign deleted successfully" });
  } catch (err) {
    next(err);
  }
}
