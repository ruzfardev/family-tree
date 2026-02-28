import type { PropsWithChildren } from 'react';
import { useAuth } from '../model/use-auth';
import { AuthContext } from '../model/auth-context';
import { LockScreen } from './lock-screen';

export function AuthProvider({ children }: PropsWithChildren) {
    const { isAuthenticated, isGuest, unlock, enterAsGuest, lock, hasPassword } = useAuth();

    if (!isAuthenticated && !isGuest) {
        return <LockScreen onUnlock={unlock} onEnterAsGuest={enterAsGuest} />;
    }

    return (
        <AuthContext.Provider value={{ lock, hasPassword, isGuest }}>
            {children}
        </AuthContext.Provider>
    );
}
