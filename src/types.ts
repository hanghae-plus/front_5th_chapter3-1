export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string; // ? 는 선택적 속성이라는 뜻. 있어도 되고 없어도 됨.
}

export interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number; // 분 단위로 저장
}

export interface Event extends EventForm {
  id: string;
}
