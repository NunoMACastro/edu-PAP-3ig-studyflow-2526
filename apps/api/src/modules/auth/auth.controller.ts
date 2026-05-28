// POST /api/auth/register
// body: { email, password, confirmPassword }
// 201: { id, email, role }

// GET /api/auth/me
// 200: { id, email, role }
// 401: { code: "UNAUTHENTICATED" }