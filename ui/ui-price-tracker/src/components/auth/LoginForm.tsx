import { useState } from 'react';
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

function getRedirectPath(): string {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (redirect?.startsWith('/') && !redirect.startsWith('//')) {
    return redirect;
  }
  return '/dashboard';
}

export function LoginForm() {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      window.location.href = getRedirectPath();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t('auth.errors.invalidCredentials'));
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
          <CardTitle>{t('auth.login.title')}</CardTitle>
          <CardDescription>{t('auth.login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? t('auth.login.submitting') ?? 'Signing in…' : t('auth.login.submit')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.login.noAccount')}{' '}
            <a href="/register" className="font-medium text-primary hover:underline">
              {t('auth.login.signUp')}
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
