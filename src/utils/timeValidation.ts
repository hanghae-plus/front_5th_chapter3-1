export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}

/**
 * 시작 시간과 종료 시간의 유효성을 검사하고 에러 메시지를 반환합니다.
 *
 * @example
 * getTimeErrorMessage('10:00', '11:00')
 * // { startTimeError: null, endTimeError: null }
 *
 * getTimeErrorMessage('11:00', '10:00')
 * // { startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.', endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.' }
 *
 * getTimeErrorMessage('', '10:00')
 * // { startTimeError: null, endTimeError: null }
 *
 * getTimeErrorMessage('10:00', '')
 * // { startTimeError: null, endTimeError: null }
 *
 * getTimeErrorMessage('', '')
 * // { startTimeError: null, endTimeError: null }
 */
export const getTimeErrorMessage = (start: string, end: string): TimeValidationResult => {
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
};
