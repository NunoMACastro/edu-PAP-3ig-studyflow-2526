export interface StudyEvent {
  createdAt: string;
}

export function formatDatePt(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function renderStudyHistoryTime(event: StudyEvent) {
  return {
    tag: "time",
    dateTime: event.createdAt,
    content: formatDatePt(event.createdAt),
  };
}
