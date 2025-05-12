export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}

/**
 * 시작 시간과 종료 시간의 유효성을 검사하고 에러 메시지를 반환합니다.
 * 시작 시간이나 종료 시간이 비어있으면 null을 반환합니다.
 * @param start - 시작 시간
 * @param end - 종료 시간
 * @returns 시작 시간과 종료 시간의 유효성 검사 결과
 */
export function getTimeErrorMessage(start: string, end: string): TimeValidationResult {
  if (!start || !end) {
    return { startTimeError: null, endTimeError: null };
  }

  const startDate = new Date(`2000-01-01T${start}`);
  const endDate = new Date(`2000-01-01T${end}`);

  if (startDate >= endDate) {
    return {
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    };
  }

  return { startTimeError: null, endTimeError: null };
}
