import { UseToastOptions } from '@chakra-ui/react';
import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useToaster } from '../../hooks/useToaster';

const mockToast = vi.fn();
vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => mockToast,
  };
});

describe('useToaster', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it('showToast는 올바른 파라미터로 toast 함수를 호출해야 한다', () => {
    const { result } = renderHook(() => useToaster());

    act(() => {
      result.current.showToast('테스트 메시지', 'success', { duration: 5000 });
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '테스트 메시지',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  });

  it('showSuccessToast는 status를 success로 설정하여 showToast를 호출해야 한다', () => {
    const { result } = renderHook(() => useToaster());

    act(() => {
      result.current.showSuccessToast('성공 메시지');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '성공 메시지',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });

  it('showErrorToast는 status를 error로 설정하여 showToast를 호출해야 한다', () => {
    const { result } = renderHook(() => useToaster());

    act(() => {
      result.current.showErrorToast('에러 메시지');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '에러 메시지',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it('showInfoToast는 status를 info로 설정하여 showToast를 호출해야 한다', () => {
    const { result } = renderHook(() => useToaster());

    act(() => {
      result.current.showInfoToast('정보 메시지');
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '정보 메시지',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  });

  it('옵션 파라미터는 기본값을 덮어써야 한다', () => {
    const { result } = renderHook(() => useToaster());

    const customOptions: Partial<UseToastOptions> = {
      duration: 5000,
      position: 'top-right',
    };

    act(() => {
      result.current.showSuccessToast('커스텀 옵션 메시지', customOptions);
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: '커스텀 옵션 메시지',
      status: 'success',
      duration: 5000,
      position: 'top-right',
      isClosable: true,
    });
  });
});
