import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const start = '23:00';
    const end = '22:00';
    const expected = {
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    };
    expect(getTimeErrorMessage(start, end)).toEqual(expected);
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const start = '23:00';
    const end = '23:00';
    const expected = {
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    };
    expect(getTimeErrorMessage(start, end)).toEqual(expected);
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const start = '20:00';
    const end = '23:00';
    const expected = {
      startTimeError: null,
      endTimeError: null,
    };
    expect(getTimeErrorMessage(start, end)).toEqual(expected);
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const start = '';
    const end = '23:00';
    const expected = {
      startTimeError: null,
      endTimeError: null,
    };
    expect(getTimeErrorMessage(start, end)).toEqual(expected);
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const start = '20:00';
    const end = '';
    const expected = {
      startTimeError: null,
      endTimeError: null,
    };
    expect(getTimeErrorMessage(start, end)).toEqual(expected);
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const start = '';
    const end = '';
    const expected = {
      startTimeError: null,
      endTimeError: null,
    };
    expect(getTimeErrorMessage(start, end)).toEqual(expected);
  });
});
