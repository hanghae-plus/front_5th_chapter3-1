import { renderHook } from '@testing-library/react';

import { useScheduleFormValidation } from '../../../../features/schedule/model/useScheduleFormValidation';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

describe('일정 폼 필드 검사 (useScheduleFormValidation)', () => {
  const errorToastInfo = {
    title: '필수 정보를 모두 입력해주세요.',
    status: 'error',
    duration: 3000,
    isClosable: true,
  };

  it('제목, 날짜, 시작시간, 종료시간이 모두 비어있으면 toast 메시지를 호출한다', () => {
    const { result } = renderHook(() => useScheduleFormValidation());

    result.current.validateRequiredFieldsCheck('', '', '', '');

    expect(mockToast).toHaveBeenCalledWith(errorToastInfo);
  });

  it('제목이 비어있으면 에러 toast를 표시한다', () => {
    const { result } = renderHook(() => useScheduleFormValidation());

    result.current.validateRequiredFieldsCheck('', '2025-01-01', '09:00', '10:00');

    expect(mockToast).toHaveBeenCalledWith(errorToastInfo);
  });

  it('날짜가 비어있으면 에러 toast를 표시한다', () => {
    const { result } = renderHook(() => useScheduleFormValidation());

    result.current.validateRequiredFieldsCheck('테스트 제목', '', '09:00', '10:00');

    expect(mockToast).toHaveBeenCalledWith(errorToastInfo);
  });

  it('시작 시간이 비어있으면 에러 toast를 표시한다', () => {
    const { result } = renderHook(() => useScheduleFormValidation());

    result.current.validateRequiredFieldsCheck('테스트 제목', '2025-01-01', '', '10:00');

    expect(mockToast).toHaveBeenCalledWith(errorToastInfo);
  });

  it('종료 시간이 비어있으면 에러 toast를 표시한다', () => {
    const { result } = renderHook(() => useScheduleFormValidation());

    result.current.validateRequiredFieldsCheck('테스트 제목', '2025-01-01', '09:00', '');

    expect(mockToast).toHaveBeenCalledWith(errorToastInfo);
  });

  it('모든 필수 필드가 채워져 있으면 toast를 호출하지 않는다', () => {
    const { result } = renderHook(() => useScheduleFormValidation());

    result.current.validateRequiredFieldsCheck('테스트 제목', '2025-01-01', '09:00', '10:00');

    expect(mockToast).not.toHaveBeenCalled();
  });
});

describe('validateTimeRangeCheck', () => {
  const errorToastInfo = {
    title: '시간 설정을 확인해주세요.',
    status: 'error',
    duration: 3000,
    isClosable: true,
  };

  it('시간 에러가 없으면 toast를 호출하지 않는다', () => {
    const { result } = renderHook(() => useScheduleFormValidation());

    result.current.validateTimeRangeCheck(null, null);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('시작 시간 에러가 있으면 toast를 표시한다', () => {
    const { result } = renderHook(() => useScheduleFormValidation());

    result.current.validateTimeRangeCheck('시작 시간 에러', null);

    expect(mockToast).toHaveBeenCalledWith(errorToastInfo);
  });

  it('종료 시간 에러가 있으면 toast를 표시한다', () => {
    const { result } = renderHook(() => useScheduleFormValidation());

    result.current.validateTimeRangeCheck(null, '종료 시간 에러');

    expect(mockToast).toHaveBeenCalledWith(errorToastInfo);
  });

  it('시작과 종료 시간 모두 에러가 있으면 toast를 표시한다', () => {
    const { result } = renderHook(() => useScheduleFormValidation());

    result.current.validateTimeRangeCheck('시작 시간 에러', '종료 시간 에러');

    expect(mockToast).toHaveBeenCalledWith(errorToastInfo);
  });
});
