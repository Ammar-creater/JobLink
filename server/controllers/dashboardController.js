const Job = require("../models/Job");
const Application = require("../models/Application");

// GET /api/employer/jobs — employer's own postings
async function getMyJobs(req, res) {
  try {
    const jobs = await Job.find({ employerId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ count: jobs.length, jobs });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// GET /api/employer/jobs/:jobId/applicants — applicants for one of employer's own jobs
async function getJobApplicants(req, res) {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Make sure this job belongs to the logged-in employer
    if (job.employerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You do not own this job posting" });
    }

    const applications = await Application.find({ jobId }).populate(
      "userId",
      "name email phone skills resumeUrl"
    );

    return res.status(200).json({ job: job.title, count: applications.length, applications });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

// PUT /api/employer/applications/:applicationId/status — shortlist / reject
async function updateApplicationStatus(req, res) {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be pending, accepted, or rejected" });
    }

    const application = await Application.findById(applicationId).populate("jobId");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Make sure the job this application belongs to is owned by the logged-in employer
    if (application.jobId.employerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You do not own the job for this application" });
    }

    application.status = status;
    await application.save();

    return res.status(200).json({ message: "Application status updated", application });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { getMyJobs, getJobApplicants, updateApplicationStatus };