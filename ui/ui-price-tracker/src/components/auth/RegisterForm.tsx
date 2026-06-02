import { useState } from 'react';
import { useGuestRedirect } from '@/hooks/useGuestRedirect';
import { Hexagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth.store';
import { APP_NAME } from '@/utils/constants';

export function RegisterForm() {
  const { t } = useTranslation();
  const { shouldRender } = useGuestRedirect();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!shouldRender) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.errors.passwordTooShort'));
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      window.location.href = '/dashboard';
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('auth.errors.registrationFailed'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 flex items-center justify-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Hexagon className="size-6" aria-hidden />
        </div>
        <span className="font-display text-2xl font-bold">{APP_NAME}</span>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle>{t('auth.register.title')}</CardTitle>
          <CardDescription>{t('auth.register.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('auth.fields.name')}</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.fields.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.fields.password')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth.fields.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? t('auth.register.submitting') ?? 'Creating account…' : t('auth.register.submit')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.register.hasAccount')}{' '}
            <a href="/login" className="font-medium text-primary hover:underline">
              {t('auth.register.signIn')}
            </a>
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-center">
        <a href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← {t('auth.backToHome')}
        </a>
      </p>
    </div>
  );
}
