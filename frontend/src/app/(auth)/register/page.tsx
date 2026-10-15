import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from '@/components/forms/register-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Create an account' };

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Create your free account</CardTitle>
        <CardDescription>Browsing is always free. An account lets you contact owners — or post your own property.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense>
          <RegisterForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
