import { createContext, useContext } from 'react';

interface AuthContextValue {
    lock: () => void;
    hasPassword: boolean;
    isGuest: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
    lock: () => {},
    hasPassword: false,
    isGuest: false,
});

export function useAuthContext(): AuthContextValue {
    return useContext(AuthContext);
}
