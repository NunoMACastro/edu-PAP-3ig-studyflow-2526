await fetch("/api/auth/login", {
  method: "POST",
  credentials: "include",
  body: JSON.stringify(payload),
});