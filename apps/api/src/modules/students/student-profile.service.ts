export async function updateMyProfile(userId: string, input: UpdateStudentProfileDto) {
  return profileRepository.updateByUserId(userId, input);
}