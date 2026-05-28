export async function registerStudent(payload: RegisterStudentDto) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Não foi possível criar a conta.");
  return response.json();
}