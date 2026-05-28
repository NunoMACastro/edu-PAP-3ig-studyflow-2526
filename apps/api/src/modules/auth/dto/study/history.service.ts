export async function listMyHistory(userId: string, studyEventModel: any) {
  return studyEventModel.find({ userId }).sort({ createdAt: -1 }).lean();
}
