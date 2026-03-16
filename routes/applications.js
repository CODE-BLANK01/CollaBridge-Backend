import { Router } from "express";
import {
  getAllApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../controllers/applicationsController.js";

const router = Router();

router.get("/", getAllApplications);
router.post("/", createApplication);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;
