import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NotificationList from '../../components/NotificationList';
import { Notification } from '../../types';
import { setup } from '../setup';

describe('NotificationList >', () => {
  const mockNotifications: Notification[] = [
    { id: '1', message: '회의 시작 10분 전입니다.' },
    { id: '2', message: '점심시간 알림입니다.' },
  ];

  it('알림이 없으면 아무것도 렌더링되지 않는다', () => {
    setup(<NotificationList notifications={[]} onClose={() => {}} />);

    // 알림 텍스트가 없어야 함
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('알림이 있으면 Alert가 렌더링된다', () => {
    setup(<NotificationList notifications={mockNotifications} onClose={() => {}} />);
    expect(screen.getByText('회의 시작 10분 전입니다.')).toBeInTheDocument();
    expect(screen.getByText('점심시간 알림입니다.')).toBeInTheDocument();
  });

  it('닫기 버튼을 누르면 onClose 콜백이 호출된다', async () => {
    const onClose = vi.fn();
    const { getAllByRole } = setup(
      <NotificationList notifications={mockNotifications} onClose={onClose} />
    );

    const closeButtons = getAllByRole('button');
    await userEvent.click(closeButtons[0]);

    expect(onClose).toHaveBeenCalledWith(0);
  });
});
