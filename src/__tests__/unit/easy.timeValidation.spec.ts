import { getTimeErrorMessage } from '../../utils/timeValidation';

const expetedErrorMessage = {
  startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
  endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
};
const expetedNullErrorMessage = {
  endTimeError: null,
  startTimeError: null,
};

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const errorMessage = getTimeErrorMessage('22:00', '21:00');
    expect(errorMessage).toEqual(expetedErrorMessage);
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const errorMessage = getTimeErrorMessage('22:00', '22:00');
    expect(errorMessage).toEqual(expetedErrorMessage);
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const errorMessage = getTimeErrorMessage('17:00', '21:00');
    expect(errorMessage).toEqual(expetedNullErrorMessage);
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const errorMessage = getTimeErrorMessage('', '21:00');
    expect(errorMessage).toEqual(expetedNullErrorMessage);
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const errorMessage = getTimeErrorMessage('17:00', '');
    expect(errorMessage).toEqual(expetedNullErrorMessage);
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const errorMessage = getTimeErrorMessage('', '');
    expect(errorMessage).toEqual(expetedNullErrorMessage);
  });
});
