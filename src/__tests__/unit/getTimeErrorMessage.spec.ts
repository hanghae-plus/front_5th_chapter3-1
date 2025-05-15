import { describe, it, expect } from 'vitest';

import { getTimeErrorMessage } from '../../shared/lib/timeValidation';

describe('getTimeErrorMessage', () => {
  it('start 또는 end 가 비어있으면 에러 없음', () => {
    expect(getTimeErrorMessage('', '')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });

    expect(getTimeErrorMessage('10:00', '')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });

    expect(getTimeErrorMessage('', '11:00')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('startTime < endTime 이면 에러 없음', () => {
    expect(getTimeErrorMessage('10:00', '11:00')).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('startTime >= endTime 이면 에러 메시지 반환', () => {
    expect(getTimeErrorMessage('11:00', '11:00')).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });

    expect(getTimeErrorMessage('12:00', '11:59')).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });
});
