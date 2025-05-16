export function getThursdayOfWeek(date: Date): Date {
  const dayOfWeek = date.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + diffToThursday);
  return thursday;
}

export function getFirstThursdayOfMonth(year: number, month: number): Date {
  const firstDayOfMonth = new Date(year, month, 1);
  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));
  return firstThursday;
}

export function calculateWeekNumber(targetThursday: Date, firstThursdayOfMonth: Date): number {
  const timeDiff = targetThursday.getTime() - firstThursdayOfMonth.getTime();
  const weekNum = Math.floor(timeDiff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return weekNum > 0 ? weekNum : 1;
}
