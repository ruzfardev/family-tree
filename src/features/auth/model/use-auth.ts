import { useState } from 'react';
import { sha256 } from '../lib/hash';

const AUTH_KEY = 'family-tree-auth';
const PASSWORD_HASH = import.meta.env.VITE_APP_PASSWORD_HASH as string | undefined;

export function useAuth() {
    const noPasswordSet = !PASSWORD_HASH;

    const [isAuthenticated, setIsAuthenticated] = useState(
        () => noPasswordSet || sessionStorage.getItem(AUTH_KEY) === 'unlocked'
    );

    const [isGuest, setIsGuest] = useState(
        () => sessionStorage.getItem(AUTH_KEY) === 'guest'
    );

    const unlock = async (password: string): Promise<boolean> => {
        const hash = await sha256(password);
        if (hash === PASSWORD_HASH) {
            sessionStorage.setItem(AUTH_KEY, 'unlocked');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const enterAsGuest = () => {
        sessionStorage.setItem(AUTH_KEY, 'guest');
        setIsGuest(true);
    };

    const lock = () => {
        sessionStorage.removeItem(AUTH_KEY);
        setIsAuthenticated(false);
        setIsGuest(false);
    };

    return { isAuthenticated, isGuest, unlock, enterAsGuest, lock, hasPassword: !noPasswordSet };
}
