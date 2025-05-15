export const weekDays = ['일', '월', '화', '수', '목', '금', '토'] as const;

export const repeatOptions = [
  [
    { label: '매일', value: 'daily' },
    { label: '매주', value: 'weekly' },
    { label: '매월', value: 'monthly' },
    { label: '매년', value: 'yearly' },
  ],
] as const;

export const categories = ['업무', '개인', '가족', '기타'];

export const notificationOptions = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];
