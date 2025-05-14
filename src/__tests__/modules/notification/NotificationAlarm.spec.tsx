import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';

import { NotificationMessageType } from '../../../base/types/notification.types';
import NotificationAlarm from '../../../modules/notification/NotificationAlarm';

describe('알림 (NotificationAlarm)', () => {
  const mockNotifications: NotificationMessageType[] = [
    { id: '1', message: '10분 후 팀 미팅 일정이 시작됩니다.' },
    { id: '2', message: '5분 후 프로젝트 회의가 시작됩니다.' },
  ];

  const mockSetNotifications = vi.fn();

  const renderNotificationAlarm = (notifications: NotificationMessageType[]) => {
    return render(
      <ChakraProvider>
        <NotificationAlarm notifications={notifications} setNotifications={mockSetNotifications} />
      </ChakraProvider>
    );
  };
  it('알림 메시지들 표시와 개수가 맞게 렌더링되어야 한다.', () => {
    renderNotificationAlarm(mockNotifications);

    mockNotifications.forEach((notification) => {
      expect(screen.getByText(notification.message)).toBeInTheDocument();
    });

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(mockNotifications.length);
  });
});
