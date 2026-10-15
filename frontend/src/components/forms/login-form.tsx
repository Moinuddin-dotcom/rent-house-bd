'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { homeForRole, safeNext } from '@/lib/redirects';
import { loginSchema, type LoginValues } from '@/lib/validations/auth';

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get('next'));

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      router.push(next ?? homeForRole(user.role));
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          New here?{' '}
          <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-primary underline">
            Create a free account
          </Link>
        </p>
      </form>
    </Form>
  );
}
