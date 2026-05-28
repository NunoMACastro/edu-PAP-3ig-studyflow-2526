export async function createRoutine(userId: string, input: CreateRoutineDto) {
  return this.routineModel.create({ ...input, userId });
}