"use client";

import { useEffect } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ContributionType, PaymentMethod } from "@/core/domain/models";
import { useCreateContribution } from "@/ui/hooks/useCreateContribution";

const schema = z.object({
  giftId: z.string().min(1),
  guestName: z.string().min(2, "Ingresa tu nombre"),
  guestEmail: z.string().email("Correo inválido"),
  type: z.enum(["CONTRIBUTION", "RESERVATION"]),
  amount: z
    .number({
      invalid_type_error: "Monto inválido"
    })
    .positive("El monto debe ser mayor a 0")
    .optional()
    .nullable(),
  paymentMethod: z.enum(["MERCADOPAGO", "BANK_TRANSFER"])
});

type FormValues = z.infer<typeof schema>;

type Props = {
  slug: string;
  giftId: string;
};

export function ContributionForm({ slug, giftId }: Props) {
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      giftId,
      type: "CONTRIBUTION",
      paymentMethod: "MERCADOPAGO"
    }
  });

  const mutation = useCreateContribution(slug);

  useEffect(() => {
    if (mutation.isSuccess) {
      reset({ giftId, type: "CONTRIBUTION", paymentMethod: "MERCADOPAGO" });
    }
  }, [mutation.isSuccess, giftId, reset]);

  const onSubmit = handleSubmit((data) => {
    mutation.mutate({
      giftId: data.giftId,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      type: data.type as ContributionType,
      amount: data.amount ?? null,
      paymentMethod: data.paymentMethod as PaymentMethod
    });
  });

  return (
    <Stack as="form" spacing={4} onSubmit={onSubmit}>
      <FormControl isInvalid={!!errors.guestName}>
        <FormLabel>Tu nombre</FormLabel>
        <Input {...register("guestName")} placeholder="Invitado/a" />
        <FormErrorMessage>{errors.guestName?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.guestEmail}>
        <FormLabel>Correo</FormLabel>
        <Input {...register("guestEmail")} placeholder="nombre@email.com" type="email" />
        <FormErrorMessage>{errors.guestEmail?.message}</FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>¿Qué quieres hacer?</FormLabel>
        <RadioGroup defaultValue="CONTRIBUTION">
          <Stack direction="row">
            <Radio value="CONTRIBUTION" {...register("type")}>
              Aportar
            </Radio>
            <Radio value="RESERVATION" {...register("type")}>
              Reservar
            </Radio>
          </Stack>
        </RadioGroup>
      </FormControl>

      <FormControl isInvalid={!!errors.amount}>
        <FormLabel>Monto (opcional)</FormLabel>
        <Input
          type="number"
          step="0.01"
          placeholder="100.00"
          {...register("amount", {
            setValueAs: (value) => (value === "" || value === null ? null : Number(value))
          })}
        />
        <FormErrorMessage>{errors.amount?.message}</FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>Forma de pago</FormLabel>
        <RadioGroup defaultValue="MERCADOPAGO">
          <Stack direction="row">
            <Radio value="MERCADOPAGO" {...register("paymentMethod")}>
              MercadoPago
            </Radio>
            <Radio value="BANK_TRANSFER" {...register("paymentMethod")}>
              Transferencia
            </Radio>
          </Stack>
        </RadioGroup>
      </FormControl>

      <Button colorScheme="purple" type="submit" isLoading={mutation.isPending}>
        Enviar
      </Button>

      {mutation.isSuccess && mutation.data.payment?.checkoutUrl && (
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            ¡Gracias! Continúa el pago en{" "}
            <a href={mutation.data.payment.checkoutUrl} target="_blank" rel="noreferrer">
              este enlace
            </a>
            .
          </AlertDescription>
        </Alert>
      )}

      {mutation.isSuccess && !mutation.data.payment && (
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          <AlertDescription>Tu aporte quedó registrado. Revisa el correo para instrucciones.</AlertDescription>
        </Alert>
      )}

      {mutation.isError && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <AlertDescription>{(mutation.error as Error).message ?? "Error al enviar aporte"}</AlertDescription>
        </Alert>
      )}
    </Stack>
  );
}

