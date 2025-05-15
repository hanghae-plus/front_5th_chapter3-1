import { CATEGORIES, NOTIFICATION_OPTIONS, WEEK_DAYS } from '../constants';

interface NotificationOption {
  value: number;
  label: string;
}

describe('Constants', () => {
  describe('CATEGORIES', () => {
    it('should have the correct categories', () => {
      expect(CATEGORIES).toEqual(['업무', '개인', '가족', '기타']);
    });

    it('should not be empty', () => {
      expect(CATEGORIES.length).toBeGreaterThan(0);
    });
  });

  describe('WEEK_DAYS', () => {
    it('should have 7 days', () => {
      expect(WEEK_DAYS.length).toBe(7);
    });

    it('should start with 일요일 and end with 토요일', () => {
      expect(WEEK_DAYS[0]).toBe('일');
      expect(WEEK_DAYS[6]).toBe('토');
    });
  });

  describe('NOTIFICATION_OPTIONS', () => {
    it('should have at least one option', () => {
      expect(NOTIFICATION_OPTIONS.length).toBeGreaterThan(0);
    });

    it('each option should have a value and a label', () => {
      NOTIFICATION_OPTIONS.forEach((option: NotificationOption) => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(typeof option.value).toBe('number');
        expect(typeof option.label).toBe('string');
      });
    });

    it('should match the predefined options', () => {
      const expectedOptions: NotificationOption[] = [
        { value: 1, label: '1분 전' },
        { value: 10, label: '10분 전' },
        { value: 60, label: '1시간 전' },
        { value: 120, label: '2시간 전' },
        { value: 1440, label: '1일 전' },
      ];
      expect(NOTIFICATION_OPTIONS).toEqual(expectedOptions);
    });
  });
});
