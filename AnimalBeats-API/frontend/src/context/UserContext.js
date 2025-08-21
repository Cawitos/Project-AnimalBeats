import { createContext } from 'react';

export const UserContext = createContext({
  User: null,
  setUser: () => {},
});
