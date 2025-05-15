import { useToast } from '@chakra-ui/react';
import { renderHook } from '@testing-library/react';

import { useToastManage } from '../../hooks/useToastManage';

// useToast mocking
vi.mock('@chakra-ui/react', () => {
  return {
    useToast: vi.fn(),
  };
});

describe('useToastManage (with vitest)', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockToast);
    mockToast.mockClear();
  });

  it('정확한 인자로 toast가 호출되어야 한다', () => {
    const { result } = renderHook(() => useToastManage());

    result.current.showToast('테스트 메시지', 'success', 4000, false);

    expect(mockToast).toHaveBeenCalledWith({
      title: '테스트 메시지',
      status: 'success',
      duration: 4000,
      isClosable: false,
    });
  });

  it('인자를 생략하면 기본값으로 toast가 호출되어야 한다', () => {
    const { result } = renderHook(() => useToastManage());

    result.current.showToast('기본값 테스트', 'info');

    expect(mockToast).toHaveBeenCalledWith({
      title: '기본값 테스트',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  });
});
