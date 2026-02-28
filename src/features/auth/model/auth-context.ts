import { createContext, useContext } from 'react';

interface AuthContextValue {
    lock: () => void;
    hasPassword: boolean;
}

export const AuthContext = createContext<AuthContextValue>({
    lock: () => {},
    hasPassword: false,
});

export function useAuthContext(): AuthContextValue {
    return useContext(AuthContext);
}
