import { useState } from 'react';

export const useNotification = () => {
  const showNotification = (message, type = 'info') => {
    alert(`[${type.toUpperCase()}] ${message}`);
  };

  return { showNotification };
};