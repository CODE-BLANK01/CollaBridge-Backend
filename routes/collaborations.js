import { Router } from "express";
import {
  getAllCollaborations,
  getCollaborationById,
  createCollaboration,
  updateCollaboration,
  deleteCollaboration,
} from "../controllers/collaborationsController.js";

const router = Router();

router.get("/", getAllCollaborations);
router.get("/:id", getCollaborationById);
router.post("/", createCollaboration);
router.put("/:id", updateCollaboration);
router.delete("/:id", deleteCollaboration);

export default router;
