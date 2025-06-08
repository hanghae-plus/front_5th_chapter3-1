import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const startTime = '14:00';
    const endTime = '12:00';
    const errorMessage = getTimeErrorMessage(startTime, endTime);
    expect(errorMessage).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const startTime = '12:00';
    const endTime = '12:00';
    const errorMessage = getTimeErrorMessage(startTime, endTime);
    expect(errorMessage).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const startTime = '10:00';
    const endTime = '12:00';
    const errorMessage = getTimeErrorMessage(startTime, endTime);
    expect(errorMessage).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const startTime = '';
    const endTime = '12:00';
    const errorMessage = getTimeErrorMessage(startTime, endTime);
    expect(errorMessage).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const startTime = '10:00';
    const endTime = '';
    const errorMessage = getTimeErrorMessage(startTime, endTime);
    expect(errorMessage).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const startTime = '';
    const endTime = '';
    const errorMessage = getTimeErrorMessage(startTime, endTime);
    expect(errorMessage).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  // 추가 테스트 케이스
  it('잘못된 시간 포맷이 주어진 경우에도 null을 반환한다', () => {
    const startTime = '99:99'; // 유효하지 않은 시각
    const endTime = '12:00';
    const errorMessage = getTimeErrorMessage(startTime, endTime);
    expect(errorMessage).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
