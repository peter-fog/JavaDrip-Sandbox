import { FC, ReactNode, createContext, useContext, useCallback } from 'react';
import { useCookies } from 'react-cookie';
import EventTracker from './EventTracker';
import { STORE_USER_COOKIE_NAME } from './constants';
import { useUniformContext } from '@uniformdev/context-react';

interface UserProfileDataContextProps {
  profile?: UserProfile.ProfileData['profile'];
  orders?: UserProfile.ProfileData['orders'];
  login: (userId: string) => void;
  register: (userId: string) => void;
  logout: () => void;
}

export const UserProfileDataContext = createContext<UserProfileDataContextProps>({
  profile: undefined,
  orders: undefined,
  login: () => null,
  register: () => null,
  logout: () => null,
});

interface userProfileDataContextProviderProps {
  children: ReactNode;
  data?: UserProfile.ProfileData;
}

const UserProfileDataContextProvider: FC<userProfileDataContextProviderProps> = ({ children, data }) => {
  const [, setCookie, removeCookie] = useCookies();
  const { context } = useUniformContext();

  const login = useCallback(
    (userId: string) => {
      setCookie(STORE_USER_COOKIE_NAME, userId);
      window.dispatchEvent(new CustomEvent('Identify User', { detail: { userId } }));
      context.forget(true);
      window.location.reload();
    },
    [context, setCookie]
  );

  const register = useCallback(
    (userId: string) => {
      setCookie(STORE_USER_COOKIE_NAME, userId);
      window.dispatchEvent(new CustomEvent('Identify User', { detail: { userId } }));
      window.location.reload();
    },
    [setCookie]
  );

  const logout = useCallback(
    () =>
      setTimeout(() => {
        removeCookie(STORE_USER_COOKIE_NAME);
        window.dispatchEvent(new CustomEvent('Reset AnonymousId'));
        context.forget(true);
        window.location.reload();
      }),
    [context, removeCookie]
  );
  return (
    <UserProfileDataContext.Provider value={{ ...data, login, register, logout }}>
      <EventTracker />
      {children}
    </UserProfileDataContext.Provider>
  );
};

export default UserProfileDataContextProvider;

export const useUserProfileDataContext = () => useContext(UserProfileDataContext);
