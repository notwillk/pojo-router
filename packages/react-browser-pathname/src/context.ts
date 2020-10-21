import React, { useContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export const PathnameContext = React.createContext<string>('');
export const UpdateContext = React.createContext(() => {
  return;
});
