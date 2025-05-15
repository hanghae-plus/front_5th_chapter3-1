export const weekDays = ['일', '월', '화', '수', '목', '금', '토'] as const;

export const repeatOptions = [
  [
    { label: '매일', value: 'daily' },
    { label: '매주', value: 'weekly' },
    { label: '매월', value: 'monthly' },
    { label: '매년', value: 'yearly' },
  ],
] as const;
