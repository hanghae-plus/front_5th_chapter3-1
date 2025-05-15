import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Notification } from '@/components/Notification';
import { Notification as NotificationType } from '@/types';
import * as hooks from '@/hooks';

// 훅 모킹
vi.mock('@/hooks', () => ({
  useEventForm: () => ({
    editingEvent: null,
    setEditingEvent: vi.fn(),
  }),
  useEventOperations: () => ({
    events: [],
  }),
  useNotifications: () => ({
    setNotifications: vi.fn(),
    notifications: [],
    notifiedEvents: [],
    removeNotification: vi.fn(),
  }),
}));

describe('Notification Component', () => {
  // 테스트 알림 데이터
  const mockNotification: NotificationType = {
    id: 'test-id-123',
    message: 'Test notification message',
  };

  it('올바른 메시지로 알림을 렌더링한다', () => {
    render(
      <ChakraProvider>
        <Notification notification={mockNotification} />
      </ChakraProvider>
    );

    // 메시지가 렌더링되었는지 확인
    expect(screen.getByText('Test notification message')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 알림이 제거된다', () => {
    // setNotifications 모의 함수 생성
    const mockSetNotifications = vi.fn();

    // 이 테스트에서 useNotifications 모킹 오버라이드
    const spy = vi.spyOn(hooks, 'useNotifications').mockImplementation(() => ({
      setNotifications: mockSetNotifications,
      notifications: [],
      notifiedEvents: [],
      removeNotification: vi.fn(),
    }));

    render(
      <ChakraProvider>
        <Notification notification={mockNotification} />
      </ChakraProvider>
    );

    // 닫기 버튼 찾아서 클릭
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    // setNotifications가 올바른 함수와 함께 호출되었는지 확인
    expect(mockSetNotifications).toHaveBeenCalled();

    // setNotifications에 전달된 필터 함수 호출
    const filterFunction = mockSetNotifications.mock.calls[0][0];
    const previousNotifications = [mockNotification];
    const result = filterFunction(previousNotifications);

    // 알림이 필터링되었는지 확인
    expect(result).toEqual([]);

    // 정리
    spy.mockRestore();
  });
});
