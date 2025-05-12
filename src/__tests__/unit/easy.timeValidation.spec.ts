import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const timeErrorMessage = getTimeErrorMessage('11:00', '10:00');
    expect(timeErrorMessage).toEqual({
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const timeErrorMessage = getTimeErrorMessage('10:00', '10:00');
    expect(timeErrorMessage).toEqual({
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const timeErrorMessage = getTimeErrorMessage('10:00', '11:00');
    expect(timeErrorMessage).toEqual({
      endTimeError: null,
      startTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const timeErrorMessage = getTimeErrorMessage('', '11:00');
    expect(timeErrorMessage).toEqual({
      endTimeError: null,
      startTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const timeErrorMessage = getTimeErrorMessage('10:00', '');
    expect(timeErrorMessage).toEqual({
      endTimeError: null,
      startTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const timeErrorMessage = getTimeErrorMessage('', '');
    expect(timeErrorMessage).toEqual({
      endTimeError: null,
      startTimeError: null,
    });
  });
});
