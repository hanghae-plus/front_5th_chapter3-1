import { screen, fireEvent } from '@testing-library/react';

import { setup } from '../../../../libs/testSetup';
import TimeRangeInput from '../../../../shares/ui/input/TimeRangeInput';

describe('TimeRangeInput', () => {
  const defaultProps = {
    startTime: '09:00',
    endTime: '17:00',
    onChangeStartTime: vi.fn(),
    onChangeEndTime: vi.fn(),
    onBlur: vi.fn(),
    startTimeTooltipLabel: '',
    endTimeTooltipLabel: '',
    isValidStartTime: true,
    isValidEndTime: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('startTime과 endTime이 주어지면 해당 값으로 렌더링되어야 한다', () => {
    setup(<TimeRangeInput {...defaultProps} />);
    const startInput = screen.getByLabelText('시작 시간');
    const endInput = screen.getByLabelText('종료 시간');

    expect(startInput).toBeInTheDocument();
    expect(startInput).toHaveValue('09:00');

    expect(endInput).toBeInTheDocument();
    expect(endInput).toHaveValue('17:00');
  });

  it('startTime이 변경되면 onChangeStartTime이 호출되어야 한다', async () => {
    const { user } = setup(<TimeRangeInput {...defaultProps} />);
    const startInput = screen.getByLabelText('시작 시간');

    await user.click(startInput);
    await user.clear(startInput);
    await user.type(startInput, '08:30');

    expect(defaultProps.onChangeStartTime).toHaveBeenCalled();
  });

  it('endTime이 변경되면 onChangeEndTime이 호출되어야 한다', async () => {
    const { user } = setup(<TimeRangeInput {...defaultProps} />);
    const endInput = screen.getByLabelText('종료 시간');

    await user.click(endInput);
    await user.clear(endInput);
    await user.type(endInput, '18:15');

    expect(defaultProps.onChangeEndTime).toHaveBeenCalled();
  });

  it('포커스가 해제되면 onBlur가 호출되어야 한다', () => {
    setup(<TimeRangeInput {...defaultProps} />);
    const startInput = screen.getByLabelText('시작 시간');
    const endInput = screen.getByLabelText('종료 시간');

    fireEvent.blur(startInput);
    expect(defaultProps.onBlur).toHaveBeenCalledWith('09:00', '17:00');

    fireEvent.blur(endInput);
    expect(defaultProps.onBlur).toHaveBeenCalledWith('09:00', '17:00');
    expect(defaultProps.onBlur).toHaveBeenCalledTimes(2);
  });

  it('startTimeTooltipLabel과 endTimeTooltipLabel이 주어지면 Tooltip이 렌더링되어야 한다', () => {
    setup(
      <TimeRangeInput
        {...defaultProps}
        startTimeTooltipLabel="Invalid start"
        endTimeTooltipLabel="Invalid end"
      />
    );

    expect(screen.getByText('Invalid start')).toBeInTheDocument();
    expect(screen.getByText('Invalid end')).toBeInTheDocument();
  });

  it('isValidStartTime과 isValidEndTime이 false일 때 aria-invalid 속성이 true여야 한다', () => {
    setup(<TimeRangeInput {...defaultProps} isValidStartTime={false} isValidEndTime={false} />);
    const startInput = screen.getByLabelText('시작 시간');
    const endInput = screen.getByLabelText('종료 시간');

    expect(startInput).toHaveAttribute('aria-invalid', 'true');
    expect(endInput).toHaveAttribute('aria-invalid', 'true');
  });
});
