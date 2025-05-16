import { describe, expect, it, vi } from 'vitest';

import { createEventToasts } from '../../utils/toastUtils';

describe('toastUtils', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    mockToast.mockClear();
  });

  it('showSuccessToast 함수는 success 상태의 토스트를 생성해야 한다', () => {
    const { showSuccessToast } = createEventToasts(mockToast);

    showSuccessToast('성공 메시지');

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith({
      title: '성공 메시지',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  });

  it('showErrorToast 함수는 error 토스트를 생성해야 한다', () => {
    const { showErrorToast } = createEventToasts(mockToast);

    showErrorToast('에러 메시지');

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith({
      title: '에러 메시지',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  });

  it('showInfoToast 함수는 info 토스트를 생성해야 한다', () => {
    const { showInfoToast } = createEventToasts(mockToast);

    showInfoToast('정보 메시지');

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith({
      title: '정보 메시지',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  });
});
