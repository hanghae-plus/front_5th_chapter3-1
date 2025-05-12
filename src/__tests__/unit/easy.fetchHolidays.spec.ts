import { fetchHolidays } from '../../apis/fetchHolidays';

const januaryHoliday = {
  '2025-01-01': '신정',
  '2025-01-29': '설날',
  '2025-01-30': '설날',
  '2025-01-31': '설날',
};

const februaryHoliday = {};

const marchHoliday = {
  '2025-03-01': '삼일절',
};

const aprilHoliday = {};

const mayHoliday = { '2025-05-05': '어린이날' };

const juneHoliday = { '2025-06-06': '현충일' };

const julyHoliday = {};

const augustHoliday = { '2025-08-15': '광복절' };

const septemberHoliday = {};

const octoberHoliday = {
  '2025-10-05': '추석',
  '2025-10-06': '추석',
  '2025-10-07': '추석',
  '2025-10-03': '개천절',
  '2025-10-09': '한글날',
};

const novemberHoliday = {};

const decemberHoliday = { '2025-12-25': '크리스마스' };
describe('fetchHolidays', () => {
  it('주어진 월의 공휴일만 반환한다', () => {
    expect(fetchHolidays(new Date('2025-01-01'))).toEqual(januaryHoliday);
    expect(fetchHolidays(new Date('2025-02-01'))).toEqual(februaryHoliday);
    expect(fetchHolidays(new Date('2025-03-01'))).toEqual(marchHoliday);
    expect(fetchHolidays(new Date('2025-04-01'))).toEqual(aprilHoliday);
    expect(fetchHolidays(new Date('2025-05-01'))).toEqual(mayHoliday);
    expect(fetchHolidays(new Date('2025-06-01'))).toEqual(juneHoliday);
    expect(fetchHolidays(new Date('2025-07-01'))).toEqual(julyHoliday);
    expect(fetchHolidays(new Date('2025-08-01'))).toEqual(augustHoliday);
    expect(fetchHolidays(new Date('2025-09-01'))).toEqual(septemberHoliday);
    expect(fetchHolidays(new Date('2025-10-01'))).toEqual(octoberHoliday);
    expect(fetchHolidays(new Date('2025-11-01'))).toEqual(novemberHoliday);
    expect(fetchHolidays(new Date('2025-12-01'))).toEqual(decemberHoliday);
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    expect(fetchHolidays(new Date('2025-02-01'))).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    expect(fetchHolidays(new Date('2025-10-01'))).toEqual(octoberHoliday);
  });
});
