import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { Repeat } from '../components/Repeat';

describe('Repeat 컴포넌트', () => {
  const mockProps = {
    repeatType: 'none',
    setRepeatType: vi.fn(),
    repeatInterval: 1,
    setRepeatInterval: vi.fn(),
    repeatEndDate: '',
    setRepeatEndDate: vi.fn(),
  };
  beforeEach(() => {
    render(
      <ChakraProvider>
        <Repeat {...mockProps} />
      </ChakraProvider>
    );
  });
  it('반복 유형을 매일, 매주, 매월, 매년을 선택하면 repeatType이 변경되는 setRepeatType 함수가 실행된다.', async () => {
    const user = userEvent.setup();

    const repeatType = await screen.findByLabelText('반복 유형');

    await user.selectOptions(repeatType, '매일');
    expect(mockProps.setRepeatType).toHaveBeenCalledWith('daily');

    await user.selectOptions(repeatType, '매주');
    expect(mockProps.setRepeatType).toHaveBeenCalledWith('weekly');

    await user.selectOptions(repeatType, '매월');
    expect(mockProps.setRepeatType).toHaveBeenCalledWith('monthly');

    await user.selectOptions(repeatType, '매년');
    expect(mockProps.setRepeatType).toHaveBeenCalledWith('yearly');
  });
  it('반복 간격 설정하면 setRepeatInterval 함수가 호출된다.', async () => {
    const user = userEvent.setup();

    const repeatInterval = await screen.findByLabelText('반복 간격');

    await user.clear(repeatInterval);
    await user.type(repeatInterval, '10');
    expect(mockProps.setRepeatInterval).toHaveBeenCalledWith(10);
  });
  it('반복 종료일을 설정하면 setRepeatEndDate 함수가 호출된다.', async () => {
    const user = userEvent.setup();

    const repeatEndDate = await screen.findByLabelText('반복 종료일');

    await user.clear(repeatEndDate);
    await user.type(repeatEndDate, '2025-10-10');
    expect(mockProps.setRepeatEndDate).toHaveBeenCalledWith('2025-10-10');
  });
});
