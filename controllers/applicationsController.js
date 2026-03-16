import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";
import * as Application from "../models/Application.js";

// GET /api/applications
export async function getAllApplications(req, res, next) {
  try {
    const db = getDB();
    const filter = Application.buildFilter(req.query);
    const applications = await db
      .collection(Application.COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
}

// POST /api/applications
export async function createApplication(req, res, next) {
  try {
    const errors = Application.validate(req.body);
    if (errors.length) {
      return res
        .status(400)
        .json({ success: false, message: errors.join("; ") });
    }
    const doc = Application.createApplicationDoc(req.body);
    const db = getDB();
    const result = await db.collection(Application.COLLECTION).insertOne(doc);
    res
      .status(201)
      .json({ success: true, data: { _id: result.insertedId, ...doc } });
  } catch (err) {
    next(err);
  }
}

// PUT /api/applications/:id
export async function updateApplication(req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid application ID" });
    }
    const errors = Application.validate(req.body, true);
    if (errors.length) {
      return res
        .status(400)
        .json({ success: false, message: errors.join("; ") });
    }
    const updates = Application.buildUpdateDoc(req.body);
    if (Object.keys(updates).length === 1) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields provided for update" });
    }
    const db = getDB();
    const result = await db
      .collection(Application.COLLECTION)
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updates },
        { returnDocument: "after" }
      );
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/applications/:id
export async function deleteApplication(req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid application ID" });
    }
    const db = getDB();
    const result = await db
      .collection(Application.COLLECTION)
      .deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }
    res.json({ success: true, message: "Application withdrawn successfully" });
  } catch (err) {
    next(err);
  }
}
