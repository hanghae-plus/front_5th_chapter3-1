import { act, renderHook } from "@testing-library/react";
import { useNotifications } from "../../hooks/useNotifications.ts";
import { Event } from "../../types.ts";
import { formatDate } from "../../utils/dateUtils.ts";
import { parseHM } from "../utils.ts";

const events: Event[] = [
  {
    id: "1",
    title: "팀 회의",
    date: "2025-10-22",
    startTime: "09:00",
    endTime: "10:00",
    location: "회의실 A",
    description: "팀 미팅",
    category: "업무",
    repeat: { type: "none", interval: 0 },
    notificationTime: 10,
  },
];

it("초기 상태에서는 알림이 없어야 한다", () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
});

it("지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다", () => {
  const defaultDate = formatDate(new Date(), 22);
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${defaultDate} 08:49:00`));
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000 * 60);
  });
  expect(result.current.notifications).toEqual([
    { id: "1", message: "10분 후 팀 회의 일정이 시작됩니다." },
  ]);
});

it("index를 기준으로 알림을 적절하게 제거할 수 있다", () => {
  const defaultDate = formatDate(new Date(), 22);
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${defaultDate} 08:49:00`));
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000 * 60);
  });
  expect(result.current.notifications).toEqual([
    { id: "1", message: "10분 후 팀 회의 일정이 시작됩니다." },
  ]);
  act(() => {
    result.current.removeNotification(0);
  });
  expect(result.current.notifications).toEqual([]);
});

it("이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다", () => {
  const defaultDate = formatDate(new Date(), 22);
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${defaultDate} 08:49:00`));
  const { result } = renderHook(() => useNotifications(events));

  act(() => {
    vi.advanceTimersByTime(1000 * 60);
  });
  expect(result.current.notifications.length).toBe(1);
  act(() => {
    vi.advanceTimersByTime(1000 * 60 * 2);
  });

  expect(result.current.notifications.length).not.toBe(2);
  expect(result.current.notifications.length).toBe(1);
});
