import { createContext, ReactNode, useContext } from 'react';

import { useOverlapDialog } from '../hooks/useOverlapDialog';

const OverlapDialogContext = createContext<ReturnType<typeof useOverlapDialog>>(null!);

export function OverlapDialogProvider({ children }: { children: ReactNode }) {
  const overlapDialog = useOverlapDialog();
  return (
    <OverlapDialogContext.Provider value={overlapDialog}>{children}</OverlapDialogContext.Provider>
  );
}

export function useOverlapDialogContext() {
  return useContext(OverlapDialogContext);
}
