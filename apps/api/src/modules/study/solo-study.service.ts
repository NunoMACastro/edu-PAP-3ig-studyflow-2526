export async function getSoloStudyState(userId: string) {
    return { studentName: profile.name, hasClass: Boolean(profile.className) };
}