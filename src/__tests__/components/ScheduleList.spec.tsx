import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ScheduleList from '../../components/ScheduleList';
import { Event } from '../../types';
import { setup } from '../setup';

const mockEvent: Event = {
  id: '1',
  title: '회의',
  date: '2025-10-01',
  startTime: '10:00',
  endTime: '11:00',
  description: '주간 회의',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 1,
    endDate: '',
  },
  notificationTime: 10,
};

const baseProps = {
  events: [mockEvent],
  notifiedEvents: ['1'],
  searchTerm: '',
  onSearch: vi.fn(),
  onEdit: vi.fn(),
  onDelete: vi.fn(),
};

describe('ScheduleList >', () => {
  it('일정이 정상적으로 렌더링된다', () => {
    setup(<ScheduleList {...baseProps} />);

    expect(screen.getByTestId('event-list')).toBeInTheDocument();
    expect(screen.getByTestId(`event-card-${mockEvent.id}`)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.date)).toBeInTheDocument();
    expect(screen.getByText(`${mockEvent.startTime} - ${mockEvent.endTime}`)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.description)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.location)).toBeInTheDocument();
  });

  it('알림 아이콘이 렌더링된다', () => {
    setup(<ScheduleList {...baseProps} />);
    const card = screen.getByTestId(`event-card-${mockEvent.id}`);
    expect(within(card).getByLabelText('알림')).toBeInTheDocument();
  });

  it('검색어 입력 시 onSearch가 호출된다', async () => {
    setup(<ScheduleList {...baseProps} />);
    await userEvent.type(screen.getByPlaceholderText(/검색어를 입력하세요/i), '회의');
    expect(baseProps.onSearch).toHaveBeenCalled();
  });

  it('수정 버튼 클릭 시 onEdit이 호출된다', async () => {
    setup(<ScheduleList {...baseProps} />);
    await userEvent.click(screen.getByTestId(`event-edit-button-${mockEvent.id}`));
    expect(baseProps.onEdit).toHaveBeenCalledWith(mockEvent);
  });

  it('삭제 버튼 클릭 시 onDelete가 호출된다', async () => {
    setup(<ScheduleList {...baseProps} />);
    await userEvent.click(screen.getByTestId(`event-delete-button-${mockEvent.id}`));
    expect(baseProps.onDelete).toHaveBeenCalledWith(mockEvent.id);
  });
});
