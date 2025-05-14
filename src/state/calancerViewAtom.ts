import { atom } from 'jotai';

type CalanderView = 'week' | 'month';

export const calanderViewAtom = atom<CalanderView>('month');
