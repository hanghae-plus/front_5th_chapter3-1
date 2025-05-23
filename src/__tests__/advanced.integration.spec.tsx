import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '@/App';
import { Providers } from '@/components/providers';

const renderApp = () =>
  render(
    <ChakraProvider>
      <Providers>
        <App />
      </Providers>
    </ChakraProvider>
  );

describe('EventManageForm', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.setSystemTime(new Date('2025-05-01'));
    user = userEvent.setup();
  });

  it('제목, 날짜, 시작/종료 시간이 없을 때 추가 버튼 클릭 시 필수 정보 에러가 나타난다', async () => {
    renderApp();

    const button = await screen.findByTestId('event-submit-button');
    await user.click(button);

    expect(await screen.findByText('필수 정보를 모두 입력해주세요.')).toBeInTheDocument();
  });

  it('시작 시간이 종료 시간보다 늦을 경우 시간 설정 에러가 나타난다', async () => {
    renderApp();

    await user.type(screen.getByLabelText('제목'), '회의');
    await user.type(screen.getByLabelText('날짜'), '2025-05-01');
    await user.clear(screen.getByLabelText('시작 시간'));
    await user.type(screen.getByLabelText('시작 시간'), '12:00');
    await user.clear(screen.getByLabelText('종료 시간'));
    await user.type(screen.getByLabelText('종료 시간'), '11:00');

    await user.click(await screen.findByTestId('event-submit-button'));

    expect(await screen.findByText(/시간 설정을 확인해주세요/)).toBeInTheDocument();
  });

  it('반복 체크 시 반복 입력 필드가 나타난다', async () => {
    renderApp();

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;
    if (!checkbox.checked) {
      await user.click(checkbox);
    }

    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument();
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument();
  });

  it('반복 체크 해제 시 반복 입력 필드가 사라진다', async () => {
    renderApp();

    const checkbox = screen.getByLabelText('반복 일정') as HTMLInputElement;
    if (checkbox.checked) {
      await user.click(checkbox);
    }

    expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
  });
});

// 일정 보기 섹션
describe('Calendar', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.setSystemTime('2025-05-01');
  });

  it('Month 뷰에서 이전 버튼을 클릭하면 이전달(4월)로 변경되어야 한다.', async () => {
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText(/2025년 4월/)).toBeInTheDocument();
  });

  it('Month 뷰에서 다음 버튼을 클릭하면 다음달(6월)로 변경되어야 한다.', async () => {
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText(/2025년 6월/)).toBeInTheDocument();
  });

  it('Week 뷰에서 이전 버튼을 클릭하면 이전주(4월 4주)로 변경되어야 한다.', async () => {
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'week');
    expect(screen.getByLabelText('view')).toHaveValue('week');

    await user.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText(/2025년 4월 4주/)).toBeInTheDocument();
  });

  it('Week 뷰에서 다음 버튼을 클릭하면 다음주(5월 2주)로 변경되어야 한다.', async () => {
    renderApp();

    await user.selectOptions(screen.getByLabelText('view'), 'week');
    expect(screen.getByLabelText('view')).toHaveValue('week');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText(/2025년 5월 2주/)).toBeInTheDocument();
  });
});
