// 카테고리 옵션
export const categories = ['업무', '개인', '가족', '기타'];

// 요일 표시
export const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

// 알림 설정 옵션
export interface NotificationOption {
  value: number;
  label: string;
}

export const notificationOptions: NotificationOption[] = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];
