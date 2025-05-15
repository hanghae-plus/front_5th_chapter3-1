import { describe, it, expect } from 'vitest';

import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage('15:00:00', '14:00:00');

    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage('10:00:00', '10:00:00');

    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('09:00:00', '10:00:00');

    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('', '10:00:00');

    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('09:00:00', '');

    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('', '');

    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('더 작은 시간 단위(분, 초)까지 비교한다', () => {
    const result = getTimeErrorMessage('10:00:01', '10:00:00');

    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
  });

  it('초 단위가 없는 시간 형식도 올바르게 처리한다', () => {
    const result = getTimeErrorMessage('09:30', '10:45');

    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });
});
