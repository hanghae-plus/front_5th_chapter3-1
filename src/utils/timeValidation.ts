export interface TimeValidationResult {
  startTimeError: string | null;
  sameTimeError: string | null;
  endTimeError: string | null;
}

export function getTimeErrorMessage(start: string, end: string): TimeValidationResult {
  if (!start || !end) {
    return { startTimeError: null, sameTimeError: null, endTimeError: null };
  }

  const startDate = new Date(`2000-01-01T${start}`);
  const endDate = new Date(`2000-01-01T${end}`);

  if (startDate > endDate) {
    return {
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      sameTimeError: null,
      endTimeError: null,
    };
  }

  if (startDate.getTime() === endDate.getTime()) {
    return {
      startTimeError: null,
      sameTimeError: '시작 시간과 종료 시간은 같을 수 없습니다.',
      endTimeError: null,
    };
  }

  if (startDate < endDate) {
    return {
      startTimeError: null,
      sameTimeError: null,
      endTimeError: null,
    };
  }

  return { startTimeError: null, sameTimeError: null, endTimeError: null };
}
