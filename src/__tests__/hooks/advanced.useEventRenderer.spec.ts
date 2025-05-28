import { renderHook } from '@testing-library/react';

import { useEventRenderer } from '../../hooks/useEventRenderer';
import { Event } from '../../types';

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: '1번 이벤트',
    date: '2025-05-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '1번 이벤트 설명',
    location: '1번 이벤트 장소',
    category: '1번 이벤트 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
  {
    id: '2',
    title: '2번 이벤트',
    date: '2025-05-16',
    startTime: '10:00',
    endTime: '11:00',
    description: '2번 이벤트 설명',
    location: '2번 이벤트 장소',
    category: '2번 이벤트 카테고리',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 0,
  },
];

describe('useEventRenderer', () => {
  it('알림이 없는 이벤트는 기본 스타일로 렌더링되어야 한다', () => {
    const { result: nonNotifiedResult } = renderHook(() =>
      useEventRenderer({ events: MOCK_EVENTS, notifiedEvents: [] })
    );
    const renderedEvent = nonNotifiedResult.current.renderEvent(MOCK_EVENTS[0]);

    expect(renderedEvent.props.bg).toBe('gray.100');
    expect(renderedEvent.props.fontWeight).toBe('normal');
    expect(renderedEvent.props.color).toBe('inherit');
  });

  it('알림이 있는 이벤트는 강조 스타일로 렌더링되어야 한다', () => {
    const { result: notifiedResult } = renderHook(() =>
      useEventRenderer({ events: MOCK_EVENTS, notifiedEvents: ['1'] })
    );
    const renderedEvent = notifiedResult.current.renderEvent(MOCK_EVENTS[0]);

    expect(renderedEvent.props.bg).toBe('red.100');
    expect(renderedEvent.props.fontWeight).toBe('bold');
    expect(renderedEvent.props.color).toBe('red.500');
  });

  it('알림이 있는 이벤트와 없는 이벤트의 렌더링 결과가 달라야 한다', () => {
    const { result: notifiedResult } = renderHook(() =>
      useEventRenderer({ events: MOCK_EVENTS, notifiedEvents: ['1'] })
    );
    const notifiedEvent = notifiedResult.current.renderEvent(MOCK_EVENTS[0]);
    const nonNotifiedEvent = notifiedResult.current.renderEvent(MOCK_EVENTS[1]);

    expect(notifiedEvent.props.bg).not.toBe(nonNotifiedEvent.props.bg);
    expect(notifiedEvent.props.fontWeight).not.toBe(nonNotifiedEvent.props.fontWeight);
    expect(notifiedEvent.props.color).not.toBe(nonNotifiedEvent.props.color);
  });

  it('알림이 없는 이벤트는 BellIcon이 표시되지 않아야 한다', () => {
    const { result: nonNotifiedResult } = renderHook(() =>
      useEventRenderer({ events: MOCK_EVENTS, notifiedEvents: [] })
    );
    const renderedEvent = nonNotifiedResult.current.renderEvent(MOCK_EVENTS[0]);

    expect(renderedEvent.props.children.props.children[0].type).not.toBe('BellIcon');
  });

  it('이벤트의 제목과 스타일이 올바르게 적용되어야 한다', () => {
    const { result: nonNotifiedResult } = renderHook(() =>
      useEventRenderer({ events: MOCK_EVENTS, notifiedEvents: [] })
    );
    const renderedEvent = nonNotifiedResult.current.renderEvent(MOCK_EVENTS[0]);

    expect(renderedEvent.props.children.props.children[1].props.children).toBe('1번 이벤트');
    expect(renderedEvent.props.children.props.children[1].props.fontSize).toBe('sm');
    expect(renderedEvent.props.children.props.children[1].props.noOfLines).toBe(1);
  });
});
