import { act, renderHook } from '@testing-library/react';
import { describe, it, beforeEach, afterAll, expect, vi } from 'vitest';
import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

// useCalendarView 훅의 초기 상태와 동작을 검증하는 테스트 모음
describe('useCalendarView 훅 초기 상태 및 동작', () => {
  // 각 테스트 실행 전 고정된 날짜 설정
  beforeEach(() => {
    // 시스템 시간을 2025-10-01로 고정
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-10-01T00:00:00'));
  });

  afterAll(() => {
    // 타이머 및 모의 설정 초기화
    vi.useRealTimers();
  });

  it('초기 view는 "month"이어야 한다', () => {
    // 훅을 렌더링하여 기본 view 값을 확인
    const { result } = renderHook(() => useCalendarView());
    expect(result.current.view).toBe('month');
  });

  it('초기 currentDate는 오늘(2025-10-01)이어야 한다', () => {
    // 오늘 날짜로 고정했으므로 currentDate 검사
    const { result } = renderHook(() => useCalendarView());
    assertDate(result.current.currentDate, new Date('2025-10-01'));
  });

  it('초기 holidays에 개천절(10/3)과 한글날(10/9)이 포함되어야 한다', () => {
    // 훅을 렌더링
    const { result } = renderHook(() => useCalendarView());
    
    // Effect 실행을 위해 타이머 실행 //act블록 처리
    act(() => {
      vi.runAllTimers();
    });
    
    const holidays = result.current.holidays;
    // 각 날짜에 맞는 휴일 이름이 매핑되어 있는지 확인
    expect(holidays).toHaveProperty('2025-10-03', '개천절');
    expect(holidays).toHaveProperty('2025-10-09', '한글날');
  });

  it('view를 "week"으로 변경 시 상태가 반영되어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    // act로 상태 변경 함수 호출
    act(() => {
      result.current.setView('week');
    });
    expect(result.current.view).toBe('week');
  });
  
  //act블록 처리 
  it('주간 뷰에서 next navigate 시 7일 후인 2025-10-08이 되어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
   
    act(() => {
      result.current.setView('week');
    });
      
    act(() => {
      result.current.navigate('next');
    });
    
    assertDate(result.current.currentDate, new Date('2025-10-08'));
  });

  it('주간 뷰에서 prev navigate 시 7일 전인 2025-09-24가 되어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    
    act(() => {
      result.current.setView('week');
    });
    
    act(() => {
      result.current.navigate('prev');
    });
    
    assertDate(result.current.currentDate, new Date('2025-09-24'));
  });

  it('월간 뷰에서 next navigate 시 한 달 후인 2025-11-01이 되어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      // 기본 view가 month이므로 바로 navigate 호출
      result.current.navigate('next');
    });
    assertDate(result.current.currentDate, new Date('2025-11-01'));
  });

  it('월간 뷰에서 prev navigate 시 한 달 전인 2025-09-01이 되어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    act(() => {
      result.current.navigate('prev');
    });
    assertDate(result.current.currentDate, new Date('2025-09-01'));
  });

  it('currentDate를 2025-01-01로 변경하면 신정(1/1)이 holidays에 반영되어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());
    
    act(() => {
      result.current.setCurrentDate(new Date('2025-01-01'));
      // 비동기 업데이트 처리
      vi.runAllTimers();
    });
    
    expect(result.current.holidays).toHaveProperty('2025-01-01', '신정');
  });
});