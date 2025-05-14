import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// 브라우저용 MSW worker 설정
export const worker = setupWorker(...handlers);
