import React from 'react';

export type SET_ACTION = {
  url?: string;
  data: object;
  type: 'REPLACE' | 'PUSH';
};

export const PathnameContext = React.createContext<string>('');
export const UpdateContext = React.createContext((action: SET_ACTION) => {
  return;
});
