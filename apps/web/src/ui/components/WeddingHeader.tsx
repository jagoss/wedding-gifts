"use client";

import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { Wedding } from "@/core/domain/models";

type Props = {
  wedding: Pick<Wedding, "title" | "date" | "location" | "message" | "heroImageUrl">;
};

export function WeddingHeader({ wedding }: Props) {
  return (
    <Box
      rounded="xl"
      overflow="hidden"
      bgImage={wedding.heroImageUrl ?? undefined}
      bgSize="cover"
      bgPos="center"
      border="1px solid"
      borderColor="gray.100"
      position="relative"
      minH="220px"
    >
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-b, rgba(0,0,0,0.45), rgba(0,0,0,0.6))"
      />
      <Stack position="relative" zIndex={1} color="white" spacing={2} p={{ base: 6, md: 10 }}>
        <Heading size="lg">{wedding.title}</Heading>
        <Text>
          {wedding.date ? new Date(wedding.date).toLocaleDateString() : "Fecha por confirmar"} ·{" "}
          {wedding.location ?? "Lugar por confirmar"}
        </Text>
        {wedding.message && <Text maxW="3xl">{wedding.message}</Text>}
      </Stack>
    </Box>
  );
}

