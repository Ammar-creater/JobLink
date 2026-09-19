/**
 * TEMPORARY MOCK AUTH MIDDLEWARE
 * ─────────────────────────────────────────────
 * This is a placeholder so Eman can test the job routes
 * BEFORE Noreen's real JWT auth middleware (feature/auth) is merged.
 *
 * ⚠️ DELETE THIS FILE AND REPLACE WITH REAL AUTH MIDDLEWARE
 *    ONCE feature/auth IS MERGED INTO main.
 *
 * How to use in Postman:
 *   Send header:  x-user-id:  <any 24-char hex string>
 *   Send header:  x-user-role: employer
 * Example:
 *   x-user-id: 650000000000000000000001
 *   x-user-role: employer
 */

const mockAuth = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  const userRole = req.headers['x-user-role'] || 'employer';

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Missing x-user-id header (mock auth). Provide a fake user ID.',
    });
  }

  // Attach a fake user object to the request
  req.user = {
    _id: userId,
    role: userRole,
    email: `${userRole}@mock.local`,
    name: `Mock ${userRole}`,
  };

  next();
};

module.exports = mockAuth;