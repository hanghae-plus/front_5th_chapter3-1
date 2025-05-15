import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  const noramlStart = '08:00';
  const start = '10:00';
  const end = '09:00';
  const endEqualStart = '10:00';
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage(start, end);
    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage(start, endEqualStart);
    expect(result.startTimeError).toBe('시작 시간은 종료 시간보다 빨라야 합니다.');
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const result = getTimeErrorMessage(noramlStart, end);
    expect(result.startTimeError).toBeNull();
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('', end);
    expect(result.startTimeError).toBeNull();
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage(noramlStart, '');
    expect(result.endTimeError).toBeNull();
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('', '');
    expect(result.startTimeError).toBeNull();
    expect(result.endTimeError).toBeNull();
  });
});
