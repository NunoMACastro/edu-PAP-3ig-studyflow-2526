export type CreateRoutineDto = {
  title: string;
  frequency: "daily" | "weekly";
  targetMinutes: number;
};