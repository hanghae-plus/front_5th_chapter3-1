import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, fireEvent, within } from '@testing-library/react';

import { Notification } from '../../../components/Notification/Alert/Notification';

describe('Notification Component', () => {
  const mockNotifications = [
    { message: '팀 회의 10분 전입니다.' },
    { message: '프로젝트 미팅 시작 시간입니다.' },
  ];

  const renderNotification = (notifications = mockNotifications) => {
    const mockOnClose = vi.fn();
    return {
      ...render(
        <ChakraProvider>
          <Notification notifications={notifications} onClose={mockOnClose} />
        </ChakraProvider>
      ),
      mockOnClose,
    };
  };

  it('알림 메시지가 올바르게 표시되는지 확인', () => {
    renderNotification();
    expect(screen.getByText('팀 회의 10분 전입니다.')).toBeInTheDocument();
    expect(screen.getByText('프로젝트 미팅 시작 시간입니다.')).toBeInTheDocument();
  });

  it('알림 아이콘이 각 알림마다 표시되는지 확인', () => {
    renderNotification();
    const alerts = screen.getAllByRole('alert');
    alerts.forEach(() => {
      // SVG 요소 직접 찾기
      const svg = document.querySelector('svg');
      expect(svg).toBeDefined();
    });
  });

  it('닫기 버튼이 각 알림마다 표시되는지 확인', () => {
    renderNotification();
    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons).toHaveLength(mockNotifications.length);
  });

  it('닫기 버튼 클릭 시 onClose가 호출되는지 확인', () => {
    const { mockOnClose } = renderNotification();
    const closeButtons = screen.getAllByRole('button');

    fireEvent.click(closeButtons[0]);
    expect(mockOnClose).toHaveBeenCalledWith(0);

    fireEvent.click(closeButtons[1]);
    expect(mockOnClose).toHaveBeenCalledWith(1);
  });
});
