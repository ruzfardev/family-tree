import { useState } from 'react';
import { sha256 } from '../lib/hash';

const AUTH_KEY = 'family-tree-auth';
const PASSWORD_HASH = import.meta.env.VITE_APP_PASSWORD_HASH as string | undefined;

export function useAuth() {
    const noPasswordSet = !PASSWORD_HASH;

    const [isAuthenticated, setIsAuthenticated] = useState(
        () => noPasswordSet || sessionStorage.getItem(AUTH_KEY) === 'unlocked'
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

    const lock = () => {
        sessionStorage.removeItem(AUTH_KEY);
        setIsAuthenticated(false);
    };

    return { isAuthenticated, unlock, lock, hasPassword: !noPasswordSet };
}
