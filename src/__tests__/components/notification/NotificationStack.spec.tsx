import { screen, fireEvent } from '@testing-library/react';
import { Mock } from 'vitest';

import NotificationStack from '../../../components/notification/NotificationStack';
import { NotificationsContext } from '../../../contexts/NotificationsContext';
import { UseNotificationsReturn } from '../../../hooks/useNotifications';
import { setup } from '../../../libs/testSetup';

interface AppNotification {
  id: string;
  message: string;
}

const createMockNotificationsContextValue = (
  overrides: Partial<UseNotificationsReturn> = {}
): UseNotificationsReturn => {
  const defaultNotifications: AppNotification[] = [];

  return {
    notifications: defaultNotifications,
    notifiedEvents: [],
    setNotifications: vi.fn(),
    ...overrides,
  };
};

describe('NotificationStack', () => {
  let currentMockContextValue: UseNotificationsReturn;
  let setNotificationsMockFunc: Mock;

  beforeEach(() => {
    setNotificationsMockFunc = vi.fn();

    currentMockContextValue = createMockNotificationsContextValue({
      setNotifications: setNotificationsMockFunc,
    });
  });

  const renderWithMockContext = (customContextProps?: Partial<UseNotificationsReturn>) => {
    if (customContextProps) {
      // notifications 배열은 항상 새로운 값으로 업데이트
      currentMockContextValue = {
        ...currentMockContextValue,
        ...customContextProps,
        notifications: customContextProps.notifications || [],
        setNotifications: setNotificationsMockFunc,
      };
    }

    // NotificationsContext.Provider를 직접 사용하여 value를 주입함
    // NotificationsProvider를 사용하면, 여러 훅과 컨텍스트와 의존성이 생겨 테스트 복잡도가 증가함
    return setup(
      <NotificationsContext.Provider value={currentMockContextValue}>
        <NotificationStack />
      </NotificationsContext.Provider>
    );
  };

  it('notification 데이터가 없다면, 알림창을 렌더링하지 않아야 한다', () => {
    const { container } = renderWithMockContext({ notifications: [] });
    const alertElement = container.querySelector('[role="alert"]');

    expect(alertElement).not.toBeInTheDocument();
  });

  it('notification 데이터가 있다면, 알림창을 렌더링해야 한다', () => {
    const notifications: AppNotification[] = [
      { id: '1', message: 'Notification One' },
      { id: '2', message: 'Notification Two' },
    ];

    renderWithMockContext({ notifications });

    expect(screen.getByText('Notification One')).toBeInTheDocument();
    expect(screen.getByText('Notification Two')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(2);
  });

  it('특정 알림창에서 Close 버튼을 클릭하면, 해당 알림창이 제거되어야 한다', () => {
    const initialNotifications: AppNotification[] = [
      { id: 'msg1', message: 'Message 1' },
      { id: 'msg2', message: 'Message 2 (to close)' },
      { id: 'msg3', message: 'Message 3' },
    ];
    renderWithMockContext({ notifications: initialNotifications });

    const closeButtonAtAlert = screen.getAllByLabelText('Close')[1];
    fireEvent.click(closeButtonAtAlert);

    const updatedNotifications = setNotificationsMockFunc.mock.calls[0][0](initialNotifications);
    expect(updatedNotifications).toEqual([
      { id: 'msg1', message: 'Message 1' },
      { id: 'msg3', message: 'Message 3' },
    ]);
  });
});
