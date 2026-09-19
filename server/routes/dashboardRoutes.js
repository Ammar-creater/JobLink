const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getMyJobs,
  getJobApplicants,
  updateApplicationStatus,
} = require("../controllers/dashboardController");

// All dashboard routes require login AND the "employer" role
router.get("/jobs", protect, authorize("employer"), getMyJobs);
router.get("/jobs/:jobId/applicants", protect, authorize("employer"), getJobApplicants);
router.put(
  "/applications/:applicationId/status",
  protect,
  authorize("employer"),
  updateApplicationStatus
);

module.exports = router;