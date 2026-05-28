response.cookie("sid", sessionId, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});