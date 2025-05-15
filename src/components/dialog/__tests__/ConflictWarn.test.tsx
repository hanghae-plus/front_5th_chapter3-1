import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { Event } from '../../../types';
import { EventConflictAlertDialog } from '../ConflictWarn';

vi.mock('@chakra-ui/react', () => ({
  AlertDialog: ({ children, isOpen }: any) =>
    isOpen ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogOverlay: ({ children }: any) => <div data-testid="alert-overlay">{children}</div>,
  AlertDialogContent: ({ children }: any) => <div data-testid="alert-content">{children}</div>,
  AlertDialogHeader: ({ children }: any) => <div data-testid="alert-header">{children}</div>,
  AlertDialogBody: ({ children }: any) => <div data-testid="alert-body">{children}</div>,
  AlertDialogFooter: ({ children }: any) => <div data-testid="alert-footer">{children}</div>,
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="button">
      {children}
    </button>
  ),
  Text: ({ children }: any) => <div data-testid="text">{children}</div>,
}));

describe('일정 겹침 경고 다이얼로그', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 일정 1',
      date: '2024-03-20',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '테스트 일정 2',
      date: '2024-03-20',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '',
      repeat: {
        type: 'none',
        interval: 1,
      },
      notificationTime: 10,
    },
  ];

  const defaultProps = {
    isOverlapDialogOpen: true,
    setIsOverlapDialogOpen: vi.fn(),
    overlappingEvents: mockEvents,
    onAlertClick: vi.fn(),
  };

  it('다이얼로그가 닫혀있을 때는 렌더링되지 않아야 함', () => {
    render(<EventConflictAlertDialog {...defaultProps} isOverlapDialogOpen={false} />);

    expect(screen.queryByTestId('alert-dialog')).not.toBeInTheDocument();
  });

  it('겹치는 일정들이 올바르게 표시되어야 함', () => {
    render(<EventConflictAlertDialog {...defaultProps} />);

    mockEvents.forEach((event) => {
      const eventText = `${event.title} (${event.date} ${event.startTime}-${event.endTime})`;
      expect(screen.getByText(eventText)).toBeInTheDocument();
    });
  });

  it('취소 버튼 클릭 시 다이얼로그가 닫혀야 함', () => {
    render(<EventConflictAlertDialog {...defaultProps} />);

    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);

    expect(defaultProps.setIsOverlapDialogOpen).toHaveBeenCalledWith(false);
  });

  it('계속 진행 버튼 클릭 시 onAlertClick이 호출되어야 함', () => {
    render(<EventConflictAlertDialog {...defaultProps} />);

    const continueButton = screen.getByText('계속 진행');
    fireEvent.click(continueButton);

    expect(defaultProps.onAlertClick).toHaveBeenCalled();
  });
});
