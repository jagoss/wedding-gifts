"use client";

import { ReactNode } from "react";
import { Box, Button, Card, CardBody, HStack, Heading, Image, Stack, Tag, Text } from "@chakra-ui/react";
import { Gift } from "@/core/domain/models";

type Props = {
  gift: Gift | (Pick<Gift, "id" | "title" | "description" | "estimatedPrice" | "currency" | "imageUrl" | "productUrl" | "type" | "status"> & {
    weddingId?: string;
  });
  footer?: ReactNode;
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  PURCHASED: "Comprado",
  HIDDEN: "Oculto"
};

export function GiftCard({ gift, footer }: Props) {
  return (
    <Card variant="outline" overflow="hidden" height="100%">
      {gift.imageUrl ? (
        <Image src={gift.imageUrl} alt={gift.title} objectFit="cover" h="180px" w="full" />
      ) : (
        <Box bg="gray.50" h="180px" w="full" display="flex" alignItems="center" justifyContent="center">
          <Text color="gray.400">Sin imagen</Text>
        </Box>
      )}
      <CardBody display="flex" flexDirection="column" gap={3}>
        <Stack spacing={2} flex={1}>
          <HStack justify="space-between" align="start">
            <Heading size="sm">{gift.title}</Heading>
            <Tag colorScheme={gift.status === "AVAILABLE" ? "green" : gift.status === "RESERVED" ? "yellow" : "purple"}>
              {statusLabels[gift.status]}
            </Tag>
          </HStack>
          {gift.description && (
            <Text fontSize="sm" color="gray.600">
              {gift.description}
            </Text>
          )}
          <HStack spacing={3}>
            <Tag colorScheme="purple" variant="subtle">
              {gift.type}
            </Tag>
            {gift.estimatedPrice && (
              <Text fontWeight="medium">
                {gift.currency ?? ""} {gift.estimatedPrice.toLocaleString()}
              </Text>
            )}
          </HStack>
        </Stack>
        <HStack justify="space-between">
          {gift.productUrl && (
            <Button as="a" href={gift.productUrl} target="_blank" rel="noreferrer" size="sm" variant="outline">
              Ver producto
            </Button>
          )}
          {footer}
        </HStack>
      </CardBody>
    </Card>
  );
}

