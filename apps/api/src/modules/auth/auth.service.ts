// Mantém o que já tinhas do BK-MF0-01:
export async function registerStudent(input: RegisterStudentDto) {
  if (input.password !== input.confirmPassword) {
    throw new Error("PASSWORD_CONFIRMATION_MISMATCH");
  }
  return { email: input.email.toLowerCase(), role: "STUDENT" };
}
export async function loginStudent(input: LoginDto) {
  throw new Error("INVALID_CREDENTIALS");
}