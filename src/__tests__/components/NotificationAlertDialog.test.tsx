import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NotificationAlertDialog } from '../../components/NotificationAlertDialog';

describe('NotificationAlertDialog 컴포넌트 테스트', () => {
  const setup = (jsx: React.ReactNode) => ({
    ...render(<ChakraProvider>{jsx}</ChakraProvider>),
    user: userEvent.setup(),
  });

  it('알림이 없으면 메시지를 렌더링하지 않는다', () => {
    const { container } = setup(
      <NotificationAlertDialog notifications={[]} setNotifications={vi.fn()} />
    );

    expect(container).toHaveTextContent('');
  });

  it('알림이 있으면 알림 모달을 렌더링한다', async () => {
    const notifications = [{ id: '1', message: '알림' }];
    const { user } = setup(
      <NotificationAlertDialog notifications={notifications} setNotifications={vi.fn()} />
    );

    await user.click(screen.getByText('알림'));

    expect(screen.getByText('알림')).toBeInTheDocument();
  });

  it('CloseButton 클릭 시 알림 제거 콜백이 호출된다', async () => {
    const notifications = [
      { id: '1', message: '첫 번째 알림' },
      { id: '2', message: '두 번째 알림' },
    ];
    const setNotifications = vi.fn();
    const { user } = setup(
      <NotificationAlertDialog notifications={notifications} setNotifications={setNotifications} />
    );
    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons.length).toBe(2);

    await user.click(closeButtons[0]);

    // setNotifications가 업데이트 함수를 인자로 호출되었는지 확인
    expect(setNotifications).toHaveBeenCalledTimes(1);
    const updateFn = setNotifications.mock.calls[0][0];
    expect(typeof updateFn).toBe('function');

    // 업데이트 함수에 notifications 배열을 전달했을 때 첫 번째 알림이 제거되는지 검증
    const updated = updateFn(notifications);
    expect(updated).toEqual([notifications[1]]);
  });
});
