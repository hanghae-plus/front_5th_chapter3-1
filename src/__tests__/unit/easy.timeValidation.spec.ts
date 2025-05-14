import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage', () => {
  const startTime = '10:00';
  const endTime = '11:00';
  const errorMessageMap = {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
  };
  const successMessageMap = {
    startTimeError: null,
    endTimeError: null,
  };

  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const errorMessage = getTimeErrorMessage(endTime, startTime);

    expect(errorMessage).toStrictEqual(errorMessageMap);
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const errorMessage = getTimeErrorMessage(startTime, startTime);

    expect(errorMessage).toStrictEqual(errorMessageMap);
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const errorMessage = getTimeErrorMessage(startTime, endTime);

    expect(errorMessage).toStrictEqual(successMessageMap);
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const errorMessage = getTimeErrorMessage('', endTime);

    expect(errorMessage).toStrictEqual(successMessageMap);
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const errorMessage = getTimeErrorMessage(startTime, '');

    expect(errorMessage).toStrictEqual(successMessageMap);
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const errorMessage = getTimeErrorMessage('', '');

    expect(errorMessage).toStrictEqual(successMessageMap);
  });
});
