'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { safeNext } from '@/lib/redirects';
import { cn } from '@/lib/utils';
import { registerSchema, type RegisterValues } from '@/lib/validations/auth';

const ACCOUNT_OPTIONS = [
  { value: 'RENTER', title: 'I want to rent', description: 'Contact owners & save favourites', icon: Search },
  { value: 'OWNER', title: 'I own property', description: 'Post flats & houses for rent', icon: Building2 },
] as const;

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      accountType: params.get('type') === 'OWNER' ? 'OWNER' : 'RENTER',
    },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      const user = await register(values);
      if (user.role === 'OWNER') {
        toast.success('Account created! Next, verify that you own the property.');
        router.push('/owner/verification');
      } else {
        toast.success('Account created! You can now contact owners.');
        router.push(next ?? '/listings');
      }
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="accountType"
          render={({ field }) => (
            <FormItem>
              <div className="grid grid-cols-2 gap-3">
                {ACCOUNT_OPTIONS.map(({ value, title, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className={cn(
                      'rounded-lg border p-3 text-left transition',
                      field.value === value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-accent',
                    )}
                  >
                    <Icon className="mb-2 h-5 w-5 text-primary" />
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {form.watch('accountType') === 'OWNER' && (
          <FormDescription>
            After registering you&apos;ll submit your ID and proof of ownership. An admin reviews it before you can post.
          </FormDescription>
        )}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating account…' : 'Create free account'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already registered?{' '}
          <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-primary underline">
            Log in
          </Link>
        </p>
      </form>
    </Form>
  );
}
