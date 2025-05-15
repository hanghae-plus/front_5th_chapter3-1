import { describe, it, expect } from 'vitest';

import { getTimeErrorMessage } from '../../shared/lib/timeValidation';

describe('getTimeErrorMessage', () => {
  it('시작 시간이 종료 시간보다 빠르면 에러가 없어야 한다', () => {
    const result = getTimeErrorMessage('09:00', '10:00');
    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('시작 시간과 종료 시간이 같으면 에러 메시지를 반환해야 한다', () => {
    const result = getTimeErrorMessage('10:00', '10:00');
    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
  });

  it('시작 시간이 종료 시간보다 늦으면 에러 메시지를 반환해야 한다', () => {
    const result = getTimeErrorMessage('11:00', '10:00');
    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
    expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
  });

  it('시작 시간이 비어 있으면 에러가 없어야 한다', () => {
    const result = getTimeErrorMessage('', '10:00');
    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('종료 시간이 비어 있으면 에러가 없어야 한다', () => {
    const result = getTimeErrorMessage('10:00', '');
    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('둘 다 비어 있으면 에러가 없어야 한다', () => {
    const result = getTimeErrorMessage('', '');
    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });

  it('시간 형식이 잘못돼도 Date 변환이 가능한 한 동작한다 (비정상 입력 대응은 이 함수 책임이 아님)', () => {
    const result = getTimeErrorMessage('aaaa', 'bbbb');
    expect(result.startTimeError).toBeNull(); // Invalid date끼리 비교이지만 JS는 숫자 연산을 해버림
    expect(result.endTimeError).toBeNull();
  });
});
