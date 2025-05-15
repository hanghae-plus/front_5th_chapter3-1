import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { describe, it, expect, vi } from 'vitest';

import NotificationList from '../components/NotificationList.tsx';

const setup = (element: ReactElement) => {
  return { ...render(<ChakraProvider>{element}</ChakraProvider>) };
};

describe('NotificationList', () => {
  it('알림이 없으면 null을 반환한다', () => {
    const setNotifications = vi.fn();
    const { container } = render(
      <NotificationList notifications={[]} setNotifications={setNotifications} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('알림이 있으면 컴포넌트를 렌더링한다', () => {
    const notifications = [{ id: '1', message: '테스트 알림' }];
    const setNotifications = vi.fn();

    const { container } = setup(
      <NotificationList notifications={notifications} setNotifications={setNotifications} />
    );

    expect(container.firstChild).not.toBeNull();
    expect(container.textContent).toContain('테스트 알림');
  });
});
