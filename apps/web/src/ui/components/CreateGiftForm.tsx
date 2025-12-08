"use client";

import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  Stack,
  Switch
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateGift } from "@/ui/hooks/useCreateGift";

const schema = z.object({
  title: z.string().min(2, "El título es obligatorio"),
  description: z.string().optional(),
  estimatedPrice: z
    .number({ invalid_type_error: "Monto inválido" })
    .nonnegative("Debe ser positivo")
    .optional()
    .nullable(),
  currency: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  productUrl: z.string().url().optional().nullable(),
  type: z.enum(["PRODUCT", "EXPERIENCE", "FUND"]),
  maxContributions: z
    .number({ invalid_type_error: "Número inválido" })
    .int()
    .positive()
    .optional()
    .nullable()
});

type FormValues = z.infer<typeof schema>;

export function CreateGiftForm({ weddingId }: { weddingId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "PRODUCT" }
  });

  const mutation = useCreateGift(weddingId);

  const onSubmit = handleSubmit((data) => {
    mutation.mutate({
      title: data.title,
      description: data.description ?? null,
      estimatedPrice: data.estimatedPrice ?? null,
      currency: data.currency ?? null,
      imageUrl: data.imageUrl ?? null,
      productUrl: data.productUrl ?? null,
      type: data.type,
      maxContributions: data.maxContributions ?? null
    });
    if (!mutation.isError) {
      reset({ type: "PRODUCT" });
    }
  });

  return (
    <Stack as="form" spacing={4} onSubmit={onSubmit}>
      <FormControl isInvalid={!!errors.title}>
        <FormLabel>Título</FormLabel>
        <Input placeholder="Cafetera" {...register("title")} />
        <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.description}>
        <FormLabel>Descripción</FormLabel>
        <Input placeholder="Notas o detalles" {...register("description")} />
        <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.estimatedPrice}>
        <FormLabel>Precio estimado</FormLabel>
        <Input
          type="number"
          step="0.01"
          placeholder="100"
          {...register("estimatedPrice", {
            setValueAs: (value) => (value === "" ? null : Number(value))
          })}
        />
        <FormErrorMessage>{errors.estimatedPrice?.message}</FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>Moneda</FormLabel>
        <Input placeholder="USD, ARS..." {...register("currency")} />
      </FormControl>

      <FormControl isInvalid={!!errors.imageUrl}>
        <FormLabel>Imagen (URL)</FormLabel>
        <Input placeholder="https://..." {...register("imageUrl")} />
        <FormErrorMessage>{errors.imageUrl?.message}</FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={!!errors.productUrl}>
        <FormLabel>URL del producto (opcional)</FormLabel>
        <Input placeholder="https://tienda.com/producto" {...register("productUrl")} />
        <FormErrorMessage>{errors.productUrl?.message}</FormErrorMessage>
      </FormControl>

      <FormControl>
        <FormLabel>Tipo</FormLabel>
        <Select {...register("type")}>
          <option value="PRODUCT">Producto</option>
          <option value="EXPERIENCE">Experiencia</option>
          <option value="FUND">Fondo</option>
        </Select>
      </FormControl>

      <FormControl isInvalid={!!errors.maxContributions}>
        <FormLabel>Aportes máximos</FormLabel>
        <Input
          type="number"
          placeholder="Ej: 5"
          {...register("maxContributions", {
            setValueAs: (value) => (value === "" ? null : Number(value))
          })}
        />
        <FormErrorMessage>{errors.maxContributions?.message}</FormErrorMessage>
      </FormControl>

      <Button colorScheme="purple" type="submit" isLoading={mutation.isPending}>
        Crear regalo
      </Button>
    </Stack>
  );
}

