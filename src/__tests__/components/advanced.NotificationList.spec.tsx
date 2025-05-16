import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, RenderOptions } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

import NotificationList from '../../components/NotificationList';
import { Notification } from '../../types';

const renderNotificationList = (ui: React.ReactNode, options?: RenderOptions) => {
  return render(ui, { wrapper: ChakraProvider, ...options });
};

describe('NotificationList Component Test', () => {
  const mockSetNotifications = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('렌더링', () => {
    it('알림이 없으면 아무것도 렌더링하지 않는다.', () => {
      const { container } = render(
        <NotificationList notifications={[]} setNotifications={mockSetNotifications} />
      );
      expect(container.firstChild).toBeNull();
      const alertElements = screen.queryAllByRole('alert');
      expect(alertElements.length).toBe(0);
    });

    it('알림 목록을 올바르게 렌더링한다.', () => {
      const notifications: Notification[] = [
        { id: '1', message: '첫 번째 알림' },
        { id: '2', message: '두 번째 알림' },
      ];
      renderNotificationList(
        <NotificationList notifications={notifications} setNotifications={mockSetNotifications} />
      );
      expect(screen.getByText('첫 번째 알림')).toBeInTheDocument();
      expect(screen.getByText('두 번째 알림')).toBeInTheDocument();
      expect(screen.getAllByRole('alert').length).toBe(2);
    });
  });

  describe('사용자 상호작용', () => {
    it('닫기 버튼을 클릭하면 setNotifications 함수를 호출한다.', () => {
      const initialNotifications: Notification[] = [
        { id: '1', message: '첫 번째 알림' },
        { id: '2', message: '두 번째 알림' },
      ];
      renderNotificationList(
        <NotificationList
          notifications={initialNotifications}
          setNotifications={mockSetNotifications}
        />
      );
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      fireEvent.click(closeButtons[0]);
      expect(mockSetNotifications).toHaveBeenCalledTimes(1);
      const updaterFunction = mockSetNotifications.mock.calls[0][0];
      const expectedNotificationsAfterClose = [initialNotifications[1]];
      expect(updaterFunction(initialNotifications)).toEqual(expectedNotificationsAfterClose);
    });

    it('닫기 버튼 클릭 시 UI에 알림 제거가 반영된다.', () => {
      let notifications: Notification[] = [
        { id: '1', message: 'Notification 1' },
        { id: '2', message: 'Notification 2' },
      ];
      const setNotificationsAndUpdateState = vi.fn((updaterOrValue) => {
        if (typeof updaterOrValue === 'function') {
          notifications = updaterOrValue(notifications);
        } else {
          notifications = updaterOrValue;
        }
      });
      const { rerender } = renderNotificationList(
        <NotificationList
          notifications={notifications}
          setNotifications={setNotificationsAndUpdateState}
        />
      );
      expect(screen.getByText('Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Notification 2')).toBeInTheDocument();
      const closeButtons = screen.getAllByRole('button', { name: /close/i });
      fireEvent.click(closeButtons[0]);
      expect(setNotificationsAndUpdateState).toHaveBeenCalledTimes(1);
      rerender(
        <NotificationList
          notifications={notifications}
          setNotifications={setNotificationsAndUpdateState}
        />
      );
      expect(screen.queryByText('Notification 1')).not.toBeInTheDocument();
      expect(screen.getByText('Notification 2')).toBeInTheDocument();
      expect(screen.getAllByRole('alert').length).toBe(1);
    });
  });
});
