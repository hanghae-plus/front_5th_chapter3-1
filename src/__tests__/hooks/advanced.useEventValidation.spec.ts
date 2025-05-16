import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';

import useEventValidation from '../../hooks/useEventValidation';
import { EventFormState } from '../../types';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', () => ({
  useToast: () => mockToast,
}));

describe('useEventValidation Hook Test', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  const baseEventFormData: EventFormState = {
    title: '테스트 이벤트',
    date: '2025-12-31',
    startTime: '10:00',
    endTime: '11:00',
    description: '',
    location: '',
    category: '',
    isRepeating: false,
    repeatType: 'none',
    repeatInterval: 1,
    repeatEndDate: '',
    notificationTime: 0,
  };

  it('모든 필드가 유효하고 시간 에러가 없으면 true를 리턴하고 토스트도 노출하지 않는다.', () => {
    const { result } = renderHook(() => useEventValidation());
    const isValid = result.current.validate(baseEventFormData, null, null);
    expect(isValid).toBe(true);
    expect(mockToast).not.toHaveBeenCalled();
  });

  describe('필드 누락 케이스', () => {
    test.each<[string, Partial<EventFormState>]>([
      ['title', { title: '' }],
      ['date', { date: '' }],
      ['startTime', { startTime: '' }],
      ['endTime', { endTime: '' }],
      ['all required fields', { title: '', date: '', startTime: '', endTime: '' }],
    ])(
      '필수 필드가 누락된 경우 false를 리턴하고 필수 정보 에러 토스트를 노출해야한다.',
      (_, missingFields) => {
        const eventFormData: EventFormState = {
          ...baseEventFormData,
          ...missingFields,
        };
        const { result } = renderHook(() => useEventValidation());
        const isValid = result.current.validate(eventFormData, null, null);
        expect(isValid).toBe(false);
        expect(mockToast).toHaveBeenCalledWith({
          title: '필수 정보를 모두 입력해주세요.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    );
  });

  describe('시간 에러 케이스', () => {
    it('시작 시간에 에러가 발생한 경우 false를 리턴하고 시간 설정 에러 토스트를 노출한다.', () => {
      const { result } = renderHook(() => useEventValidation());
      const isValid = result.current.validate(baseEventFormData, '시작 시간 오류', null);
      expect(isValid).toBe(false);
      expect(mockToast).toHaveBeenCalledWith({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });

    it('종료 시간에 에러가 발생한 경우 false를 리턴하고 시간 설정 에러 토스트를 노출한다.', () => {
      const { result } = renderHook(() => useEventValidation());
      const isValid = result.current.validate(baseEventFormData, null, '종료 시간 오류');
      expect(isValid).toBe(false);
      expect(mockToast).toHaveBeenCalledWith({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });

    it('startTimeError와 endTimeError가 모두 있는 경우 false를 리턴하고 시간 설정 에러 토스트를 노출한다.', () => {
      const { result } = renderHook(() => useEventValidation());
      const isValid = result.current.validate(
        baseEventFormData,
        '시작 시간 오류',
        '종료 시간 오류'
      );
      expect(isValid).toBe(false);
      expect(mockToast).toHaveBeenCalledWith({
        title: '시간 설정을 확인해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it('필수 필드 누락과 시간 에러가 동시에 발생하면 필수 정보 에러 토스트를 우선 노출해야한다.', () => {
    const { result } = renderHook(() => useEventValidation());
    const eventFormData: EventFormState = {
      ...baseEventFormData,
      title: '',
    };
    const isValid = result.current.validate(eventFormData, '시작 시간 오류', null);
    expect(isValid).toBe(false);
    expect(mockToast).toHaveBeenCalledWith({
      title: '필수 정보를 모두 입력해주세요.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });
});
