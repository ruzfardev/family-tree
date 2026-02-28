import type { PropsWithChildren } from 'react';
import { useAuth } from '../model/use-auth';
import { AuthContext } from '../model/auth-context';
import { LockScreen } from './lock-screen';

export function AuthProvider({ children }: PropsWithChildren) {
    const { isAuthenticated, unlock, lock, hasPassword } = useAuth();

    if (!isAuthenticated) {
        return <LockScreen onUnlock={unlock} />;
    }

    return (
        <AuthContext.Provider value={{ lock, hasPassword }}>
            {children}
        </AuthContext.Provider>
    );
}
