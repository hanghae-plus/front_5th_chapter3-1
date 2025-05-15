import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    // Given
    const start = '15:00';
    const end = '14:00';

    // When
    const result = getTimeErrorMessage(start, end);

    // Then
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    // Given
    const start = '10:00';
    const end = '10:00';

    // When
    const result = getTimeErrorMessage(start, end);

    // Then
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    // Given
    const start = '09:00';
    const end = '10:00';

    // When
    const result = getTimeErrorMessage(start, end);

    // Then
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    // Given
    const start = '';
    const end = '12:00';

    // When
    const result = getTimeErrorMessage(start, end);

    // Then
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    // Given
    const start = '12:00';
    const end = '';

    // When
    const result = getTimeErrorMessage(start, end);

    // Then
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    // Given
    const start = '';
    const end = '';

    // When
    const result = getTimeErrorMessage(start, end);

    // Then
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});
