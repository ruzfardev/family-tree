import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';

interface LockScreenProps {
    onUnlock: (password: string) => Promise<boolean>;
    onEnterAsGuest: () => void;
}

export function LockScreen({ onUnlock, onEnterAsGuest }: LockScreenProps) {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || isLoading) return;

        setIsLoading(true);
        setHasError(false);

        const success = await onUnlock(password);
        if (!success) {
            setHasError(true);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-dvh w-screen items-center justify-center overflow-y-auto bg-primary py-10">
            <div className="flex w-full max-w-sm flex-col items-center gap-8 px-6">
                {/* Logo */}
                <img src="logo.png" alt={t('toolbar.logoAlt')} className="size-16" />

                {/* Title */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                    <h1 className="text-xl font-semibold text-primary">{t('lockScreen.title')}</h1>
                    <p className="text-sm text-tertiary">{t('lockScreen.subtitle')}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
                    <Input
                        type="password"
                        label={t('lockScreen.passwordLabel')}
                        placeholder={t('lockScreen.passwordPlaceholder')}
                        value={password}
                        onChange={(value) => {
                            setPassword(value);
                            if (hasError) setHasError(false);
                        }}
                        isInvalid={hasError}
                        hint={hasError ? t('lockScreen.wrongPassword') : undefined}
                        autoFocus
                    />

                    <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        className="w-full justify-center"
                        isLoading={isLoading}
                        isDisabled={!password || isLoading}
                    >
                        {isLoading ? t('lockScreen.unlocking') : t('lockScreen.unlockButton')}
                    </Button>
                </form>

                {/* Guest access */}
                <div className="flex w-full items-center gap-3">
                    <hr className="flex-1 border-secondary" />
                    <span className="text-xs text-tertiary">or</span>
                    <hr className="flex-1 border-secondary" />
                </div>

                <Button
                    color="secondary"
                    size="lg"
                    className="w-full justify-center"
                    onClick={onEnterAsGuest}
                >
                    {t('lockScreen.continueAsGuest')}
                </Button>
            </div>
        </div>
    );
}
