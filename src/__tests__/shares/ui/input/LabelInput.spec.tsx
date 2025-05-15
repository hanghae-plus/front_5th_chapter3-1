import { screen, fireEvent } from '@testing-library/react';

import { setup } from '../../../../libs/testSetup';
import LabelInput from '../../../../shares/ui/input/LabelInput';

describe('LabelInput', () => {
  const defaultProps = {
    label: 'Username',
    value: 'john',
    onChange: vi.fn(),
    type: 'text' as const,
    placeholder: 'Enter your name',
  };

  beforeEach(() => {
    defaultProps.onChange.mockClear();
  });

  it('label이 주어지면 label이 렌더링되어야 한다', () => {
    setup(<LabelInput {...defaultProps} />);

    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('value, onChange, type, placeholder가 주어지면 해당 값으로 렌더링되어야 한다', () => {
    setup(<LabelInput {...defaultProps} />);
    const input = screen.getByRole('textbox', { name: 'Username' });

    expect(input).toHaveValue('john');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder', 'Enter your name');
  });

  it('값을 변경하면 onChange가 호출되어야 한다', () => {
    setup(<LabelInput {...defaultProps} />);
    const input = screen.getByRole('textbox', { name: 'Username' });

    fireEvent.change(input, { target: { value: 'doe' } });

    expect(defaultProps.onChange).toHaveBeenCalledWith('doe');
  });

  it('type이 email일 때 이메일 입력 필드로 렌더링되어야 한다', () => {
    setup(<LabelInput {...defaultProps} type="email" placeholder="you@example.com" />);
    const input = screen.getByRole('textbox', { name: 'Username' });

    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'you@example.com');
  });
});
