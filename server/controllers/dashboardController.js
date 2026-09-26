const mongoose = require("mongoose");
const JobPosting = require("../models/JobPosting");
const Application = require("../models/Application");
const Notification = require("../models/Notification");

// GET /api/employer/jobs — employer's own postings
async function getMyJobs(req, res) {
  try {
    const jobs = await JobPosting.find({ employerId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: { count: jobs.length, jobs },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// GET /api/employer/jobs/:jobId/applicants — applicants for one of employer's own jobs
async function getJobApplicants(req, res) {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ success: false, message: "Invalid job id" });
    }

    const job = await JobPosting.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You do not own this job posting" });
    }

    const applications = await Application.find({ jobId }).populate(
      "userId",
      "name email phone skills resumeUrl"
    );

    return res.status(200).json({
      success: true,
      data: { job: job.title, count: applications.length, applications },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

// PUT /api/employer/applications/:applicationId/status — shortlist / reject
async function updateApplicationStatus(req, res) {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ success: false, message: "Invalid application id" });
    }

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending, accepted, or rejected",
      });
    }

    const application = await Application.findById(applicationId).populate("jobId");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (application.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You do not own the job for this application",
      });
    }

    application.status = status;
    await application.save();

    // Create a notification for the applicant — failure here must not break the status update response
    try {
      const jobTitle = application.jobId && application.jobId.title ? application.jobId.title : "applied job";

      await Notification.create({
        userId: application.userId,
        message: `Your application for "${jobTitle}" has been ${status}.`,
        type: "application_status",
        relatedApplicationId: application._id,
      });
    } catch (notificationErr) {
      console.error("Failed to create application status notification:", notificationErr.message);
    }

    return res.status(200).json({
      success: true,
      data: { application },
      message: "Application status updated",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
}

module.exports = { getMyJobs, getJobApplicants, updateApplicationStatus };