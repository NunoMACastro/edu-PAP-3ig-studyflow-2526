export async function registerStudent(input: RegisterStudentDto) {
  if (input.password !== input.confirmPassword) {
    throw new Error("PASSWORD_CONFIRMATION_MISMATCH");
  }
  return { email: input.email.toLowerCase(), role: "STUDENT" };
}