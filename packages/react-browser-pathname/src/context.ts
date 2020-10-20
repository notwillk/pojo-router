import React, { useContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

export const PathnameContext = React.createContext<string | null>(null);
export const UpdateContext = React.createContext(() => {
  return;
});
