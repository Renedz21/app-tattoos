import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { type PaymentFormValues, paymentForm } from '@/modules/schemas/admin-edit-form.schema';
import { zodResolver } from '@hookform/resolvers/zod';

export default function useDepositForm(defaultValues: Partial<PaymentFormValues> = {}) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentForm),
    defaultValues: {
      depositCents: defaultValues?.depositCents ?? "",
      priceCents: defaultValues?.priceCents ?? "",
      status: defaultValues?.status ?? "",
      quotedAt: defaultValues?.quotedAt ?? undefined,
      depositDueAt: defaultValues?.depositDueAt ?? undefined,
    },
  });

  const handleSubmit = async (data: PaymentFormValues) => {
    console.log(data);
  };

  return {
    form,
    handleSubmit,
  }
}
