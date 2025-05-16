import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage', () => {
  it('시작 시간이 종료 시간보다 늦으면 양쪽 모두 에러 메시지를 반환해야 한다', () => {
    const result = getTimeErrorMessage('14:00', '13:00');
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage('10:00', '10:00');
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠르면 에러 메시지는 모두 null이어야 한다', () => {
    const result = getTimeErrorMessage('09:00', '11:00');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어 있으면 검증을 하지 않고 null을 반환해야 한다', () => {
    const result = getTimeErrorMessage('', '12:00');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어 있으면 검증을 하지 않고 null을 반환해야 한다', () => {
    const result = getTimeErrorMessage('09:00', '');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작과 종료 시간이 모두 없으면 검증하지 않고 null을 반환해야 한다', () => {
    const result = getTimeErrorMessage('', '');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
