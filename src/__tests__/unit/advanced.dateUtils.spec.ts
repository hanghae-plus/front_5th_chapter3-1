import {
  getThursdayOfWeek,
  getFirstThursdayOfMonth,
  calculateWeekNumber,
} from '../../utils/advanced.dateUtils';

describe('advanced.dateUtils', () => {
  describe('getThursdayOfWeek', () => {
    it('이미 목요일인 경우 해당 날짜를 반환해야 한다.', () => {
      const date = new Date(2025, 6, 17);
      expect(getThursdayOfWeek(date).getDate()).toBe(17);
    });

    it('목요일 이전의 날짜인 경우 해당 주의 목요일을 반환해야 한다.', () => {
      const date = new Date(2025, 6, 15);
      const thursday = getThursdayOfWeek(date);
      expect(thursday.getFullYear()).toBe(2025);
      expect(thursday.getMonth()).toBe(6);
      expect(thursday.getDate()).toBe(17);
    });

    it('목요일 이후의 날짜인 경우 해당 주의 목요일을 반환해야 한다.', () => {
      const date = new Date(2025, 6, 20);
      const thursday = getThursdayOfWeek(date);
      expect(thursday.getFullYear()).toBe(2025);
      expect(thursday.getMonth()).toBe(6);
      expect(thursday.getDate()).toBe(24);
    });

    it('월이 바뀌는 주의 목요일을 정확히 계산해야 한다.', () => {
      const thursday = getThursdayOfWeek(new Date(2025, 6, 30));
      expect(thursday.getFullYear()).toBe(2025);
      expect(thursday.getMonth()).toBe(6);
      expect(thursday.getDate()).toBe(31);
    });

    it('해가 바뀌는 주의 목요일을 정확히 계산해야 한다.', () => {
      const date = new Date(2025, 11, 30);
      const thursday = getThursdayOfWeek(date);
      expect(thursday.getFullYear()).toBe(2026);
      expect(thursday.getMonth()).toBe(0);
      expect(thursday.getDate()).toBe(1);
    });
  });

  describe('getFirstThursdayOfMonth', () => {
    it('월의 첫째 날이 목요일인 경우 해당 날짜를 반환해야 한다.', () => {
      const firstThursday = getFirstThursdayOfMonth(2025, 4);
      expect(firstThursday.getFullYear()).toBe(2025);
      expect(firstThursday.getMonth()).toBe(4);
      expect(firstThursday.getDate()).toBe(1);
    });

    it('월의 첫째 날이 목요일 이전인 경우 해당 월의 첫 목요일을 반환해야 한다.', () => {
      const firstThursday = getFirstThursdayOfMonth(2025, 6);
      expect(firstThursday.getFullYear()).toBe(2025);
      expect(firstThursday.getMonth()).toBe(6);
      expect(firstThursday.getDate()).toBe(3);
    });

    it('월의 첫째 날이 목요일 이후인 경우 해당 월의 첫 목요일을 반환해야 한다.', () => {
      const firstThursdayAug = getFirstThursdayOfMonth(2025, 7);
      expect(firstThursdayAug.getFullYear()).toBe(2025);
      expect(firstThursdayAug.getMonth()).toBe(7);
      expect(firstThursdayAug.getDate()).toBe(7);

      const firstThursdaySep = getFirstThursdayOfMonth(2025, 8);
      expect(firstThursdaySep.getFullYear()).toBe(2025);
      expect(firstThursdaySep.getMonth()).toBe(8);
      expect(firstThursdaySep.getDate()).toBe(4);
    });

    it('2025년 2월의 첫 목요일은 6일이어야 한다.', () => {
      const firstThursday = getFirstThursdayOfMonth(2025, 1);
      expect(firstThursday.getFullYear()).toBe(2025);
      expect(firstThursday.getMonth()).toBe(1);
      expect(firstThursday.getDate()).toBe(6);
    });
  });

  describe('calculateWeekNumber', () => {
    it('targetThursday와 firstThursdayOfMonth가 같으면 1주차를 반환해야 한다.', () => {
      const date = new Date(2025, 6, 3);
      expect(calculateWeekNumber(date, date)).toBe(1);
    });

    it('targetThursday가 firstThursdayOfMonth보다 1주일 뒤면 2주차를 반환해야 한다.', () => {
      const firstThursday = new Date(2025, 6, 3);
      const targetThursday = new Date(2025, 6, 10);
      expect(calculateWeekNumber(targetThursday, firstThursday)).toBe(2);
    });

    it('targetThursday가 firstThursdayOfMonth보다 이전이면 1주차를 반환해야 한다.', () => {
      const firstThursday = new Date(2025, 6, 10);
      const targetThursday = new Date(2025, 6, 3);
      expect(calculateWeekNumber(targetThursday, firstThursday)).toBe(1);
    });

    it('targetThursday가 firstThursdayOfMonth보다 3주 뒤면 4주차를 반환해야 한다.', () => {
      const firstThursday = new Date(2025, 6, 3);
      const targetThursday = new Date(2025, 6, 24);
      expect(calculateWeekNumber(targetThursday, firstThursday)).toBe(4);
    });

    it('targetThursday가 firstThursdayOfMonth보다 6일 뒤면 1주차를 반환해야 한다.', () => {
      const firstThursday = new Date(2025, 6, 3);
      const targetThursday = new Date(2025, 6, 9);
      expect(calculateWeekNumber(targetThursday, firstThursday)).toBe(1);
    });

    it('targetThursday가 firstThursdayOfMonth보다 8일 뒤면 2주차를 반환해야 한다.', () => {
      const firstThursday = new Date(2025, 6, 3);
      const targetThursday = new Date(2025, 6, 11);
      expect(calculateWeekNumber(targetThursday, firstThursday)).toBe(2);
    });
  });
});
