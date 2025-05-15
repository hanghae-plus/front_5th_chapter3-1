import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage', () => {
  it('시작 시간이 종료 시간보다 빠른 경우 에러가 없다', () => {
    const result = getTimeErrorMessage('09:00', '10:00');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 종료 시간과 같은 경우 에러를 반환한다', () => {
    const result = getTimeErrorMessage('09:00', '09:00');
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 늦은 경우 에러를 반환한다', () => {
    const result = getTimeErrorMessage('10:00', '09:00');
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 비어있는 경우 에러가 없다', () => {
    const result = getTimeErrorMessage('', '10:00');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있는 경우 에러가 없다', () => {
    const result = getTimeErrorMessage('09:00', '');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('두 시간이 모두 비어있는 경우 에러가 없다', () => {
    const result = getTimeErrorMessage('', '');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  // 좀 이상함 ...
  it('자정을 넘어가는 시간도 올바르게 처리한다', () => {
    const result = getTimeErrorMessage('23:30', '24:30');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시간 형식이 올바른 경우 에러가 없다', () => {
    const result = getTimeErrorMessage('09:30', '10:30');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
