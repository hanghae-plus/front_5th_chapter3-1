import { useState } from 'react';

export const useOverlapDialog = () => {
  const [isOverlapDialogOpen, setIsOverlapDialogOpen] = useState(false);

  const closeOverlapDialog = () => {
    setIsOverlapDialogOpen(false);
  };

  const openOverlapDialog = () => {
    setIsOverlapDialogOpen(true);
  };

  return {
    isOverlapDialogOpen,
    openOverlapDialog,
    closeOverlapDialog,
  };
};
