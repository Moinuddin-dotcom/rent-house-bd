'use client';

import { BadgeCheck, MessageSquareText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import { normalizePhone } from '@/lib/utils';

const BD_MOBILE = /^(\+?880|0)1[3-9]\d{8}$/;

interface SendCodeResponse {
  sent: boolean;
  expiresInSeconds: number;
  devCode?: string;
}

/** Whether `phone` is the number already verified on the current account. */
export function useIsPhoneVerified(phone: string) {
  const { user } = useAuth();
  return !!user?.phoneVerifiedAt && !!user.phone && normalizePhone(user.phone) === normalizePhone(phone);
}

/** "Send code → enter code" flow that confirms the phone number by SMS. */
export function PhoneVerification({ phone }: { phone: string }) {
  const { refresh } = useAuth();
  const verified = useIsPhoneVerified(phone);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (verified) {
    return (
      <p className="flex items-center gap-1 text-[0.8rem] font-medium text-emerald-600">
        <BadgeCheck className="h-4 w-4" /> Phone number verified
      </p>
    );
  }

  const codeSentForThisNumber = sentTo !== null && normalizePhone(sentTo) === normalizePhone(phone);

  const sendCode = async () => {
    setBusy(true);
    try {
      const res = await api<SendCodeResponse>('/phone/send-code', { method: 'POST', body: { phone } });
      setSentTo(phone);
      setCode('');
      setCooldown(60);
      toast.success(res.devCode ? `Test mode: no SMS sent. Enter code ${res.devCode}` : 'Code sent by SMS');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    try {
      await api('/phone/verify', { method: 'POST', body: { phone, code } });
      await refresh();
      toast.success('Phone number verified');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-[0.8rem] text-muted-foreground">We will send a 6-digit code by SMS to confirm this number.</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={sendCode}
          disabled={busy || cooldown > 0 || !BD_MOBILE.test(phone)}
        >
          <MessageSquareText /> {codeSentForThisNumber ? (cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code') : 'Send code'}
        </Button>
        {codeSentForThisNumber && (
          <>
            <Input
              className="h-9 w-32"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
            <Button type="button" size="sm" onClick={verify} disabled={busy || code.length !== 6}>
              Verify
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
