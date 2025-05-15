import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useOverlapDialog } from '../../hooks/useOverlapDialog.ts';

describe('useOverlapDialog', () => {
  it('초기 상태의 다이얼로그는 닫혀 있어야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });

  it('다이얼로그를 열고 닫는 함수가 상태를 올바르게 업데이트해야 한다', () => {
    const { result } = renderHook(() => useOverlapDialog());
    expect(result.current.isOverlapDialogOpen).toBe(false);

    // 다이얼로그 open
    act(() => {
      result.current.openOverlapDialog();
    });
    expect(result.current.isOverlapDialogOpen).toBe(true);

    // 다이얼로그 close
    act(() => {
      result.current.closeOverlapDialog();
    });
    expect(result.current.isOverlapDialogOpen).toBe(false);
  });
});
