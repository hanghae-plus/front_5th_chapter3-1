import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage('14:00', '13:00');

    expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage('15:30', '15:30');

    expect(result.endTimeError).toBe('종료 시간은 시작 시간보다 늦어야 합니다.');
    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('09:00', '10:00');

    expect(result.endTimeError).toBeNull();
    expect(result.startTimeError).toBeNull();
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('', '13:00');

    expect(result.endTimeError).toBeNull();
    expect(result.startTimeError).toBeNull();
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('4:00', '');

    expect(result.endTimeError).toBeNull();
    expect(result.startTimeError).toBeNull();
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('', '');

    expect(result.endTimeError).toBeNull();
    expect(result.startTimeError).toBeNull();
  });
});
