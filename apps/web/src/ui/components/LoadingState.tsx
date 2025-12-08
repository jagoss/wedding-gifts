"use client";

import { Center, Spinner, Stack, Text } from "@chakra-ui/react";

export function LoadingState({ label = "Cargando..." }: { label?: string }) {
  return (
    <Center w="full" py={8}>
      <Stack align="center" spacing={3}>
        <Spinner color="purple.500" />
        <Text color="gray.600">{label}</Text>
      </Stack>
    </Center>
  );
}

