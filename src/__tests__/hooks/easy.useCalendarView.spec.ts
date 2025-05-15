import { act, render, renderHook, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import App from '../../App';
import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { formatDate } from '../../utils/dateUtils.ts';
// import { assertDate } from '../utils.ts'; // TODO: assertDate 활용?

type CalendarViewResult = ReturnType<typeof useCalendarView>;

describe('useCalendarView', () => {
  let result: { current: CalendarViewResult };

  beforeEach(() => {
    const hook = renderHook(() => useCalendarView());
    result = hook.result;
  });

  describe('초기 상태', () => {
    it('view는 "month"이어야 한다', () => {
      expect(result.current.view).toBe('month');
    });

    it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
      const currentDateString = formatDate(result.current.currentDate);
      const todayString = formatDate(new Date());
      expect(currentDateString).toBe(todayString);
    });

    it('holidays는 10월 휴일인 개천절, 한글날이 지정되어 있어야 한다', () => {
      act(() => {
        result.current.setCurrentDate(new Date('2025-10-01'));
      });

      const holidayEvents = Object.values(result.current.holidays);
      expect(holidayEvents).toContain('개천절');
      expect(holidayEvents).toContain('한글날');
    });
  });

  it("view를 'week'으로 변경 시, month view에서 week view로 변경된다.", () => {
    const { getByTestId, getByLabelText } = render(React.createElement(App));
    const monthView = getByTestId('month-view');
    const monthHeading = monthView.querySelector('h2');
    expect(monthHeading?.textContent).toMatch(/\d{4}년 \d{1,2}월/);

    act(() => {
      fireEvent.change(getByLabelText('view'), { target: { value: 'week' } });
    });

    const weekView = getByTestId('week-view');
    const weekHeading = weekView.querySelector('h2');
    expect(weekHeading?.textContent).toMatch(/\d{4}년 \d{1,2}월 \d{1,2}주/);
  });

  it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
    act(() => {
      result.current.setView('week');
    });
    expect(result.current.view).toBe('week'); // week-view 확인

    act(() => {
      result.current.setCurrentDate(new Date('2025-10-01'));
    });

    act(() => {
      result.current.navigate('next');
    });

    const currentDateString = formatDate(result.current.currentDate);
    expect(currentDateString).toBe('2025-10-08');
  });

  it("주간 뷰에서 이전으로 navigate시 7일 전 '2025-09-24' 날짜로 지정이 된다", () => {
    act(() => {
      result.current.setView('week');
    });
    expect(result.current.view).toBe('week'); // week-view 확인

    act(() => {
      result.current.setCurrentDate(new Date('2025-10-01'));
    });

    act(() => {
      result.current.navigate('prev');
    });

    const currentDateString = formatDate(result.current.currentDate);
    expect(currentDateString).toBe('2025-09-24');
  });

  it("월간 뷰에서 다음으로 navigate시 한 달 전 '2025-11-01' 날짜여야 한다", () => {
    expect(result.current.view).toBe('month'); // month-view 확인

    act(() => {
      result.current.setCurrentDate(new Date('2025-10-01'));
    });

    act(() => {
      result.current.navigate('next');
    });

    const currentDateString = formatDate(result.current.currentDate);
    expect(currentDateString).toBe('2025-11-01');
  });

  it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
    expect(result.current.view).toBe('month'); // month-view 확인

    act(() => {
      result.current.setCurrentDate(new Date('2025-10-01'));
    });

    act(() => {
      result.current.navigate('prev');
    });

    const currentDateString = formatDate(result.current.currentDate);
    expect(currentDateString).toBe('2025-09-01');
  });

  // 1일 밑에 '신정'이  표기되어야 한다는 뜻인지, holiday 중 '신정'이 포함되면 되는건지?
  it("currentDate가 '2025-01-01' 변경되면 1월 휴일 '신정'으로 업데이트되어야 한다", async () => {
    expect(result.current.view).toBe('month'); // month-view 확인 (week-view에서는 구현되어 있지 않음)

    act(() => {
      result.current.setCurrentDate(new Date('2025-01-01'));
    });

    const holidayEvents = Object.values(result.current.holidays);
    expect(holidayEvents).toContain('신정');
    expect(holidayEvents).toContain('설날');
  });
});
