expect(result).toMatchObject({ email: "aluno@example.com", role: "STUDENT" });
expect(result).not.toHaveProperty("passwordHash");