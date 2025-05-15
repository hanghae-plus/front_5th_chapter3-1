import { getTimeErrorMessage } from '../../utils/timeValidation';

const ERROR_MESSAGE = {
  startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
  endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
};

const NULL_ERROR_MESSAGE = {
  startTimeError: null,
  endTimeError: null,
};

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const message = getTimeErrorMessage('23:00', '01:00');

    expect(message).toEqual(ERROR_MESSAGE);
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const message = getTimeErrorMessage('23:00', '23:00');

    expect(message).toEqual(ERROR_MESSAGE);
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const message = getTimeErrorMessage('01:00', '23:00');

    expect(message).toEqual(NULL_ERROR_MESSAGE);
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const message = getTimeErrorMessage('', '23:00');

    expect(message).toEqual(NULL_ERROR_MESSAGE);
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const message = getTimeErrorMessage('23:00', '');

    expect(message).toEqual(NULL_ERROR_MESSAGE);
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const message = getTimeErrorMessage('', '');

    expect(message).toEqual(NULL_ERROR_MESSAGE);
  });
});
