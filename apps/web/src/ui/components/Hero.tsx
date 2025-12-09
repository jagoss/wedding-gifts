"use client";

import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import type { Route } from "next";

export function Hero() {
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      align="center"
      gap={8}
      bgGradient="linear(to-r, purple.700, purple.500)"
      color="white"
      rounded="xl"
      px={{ base: 6, md: 10 }}
      py={{ base: 10, md: 12 }}
      boxShadow="lg"
    >
      <Stack spacing={4} flex={1}>
        <Heading size="xl">Tu mesa de regalos, sin complicaciones</Heading>
        <Text fontSize="lg">
          Crea una lista de regalos o fondos, comparte un enlace y recibe aportes con estados claros para ti y tus invitados.
        </Text>
        <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
          <Button as={NextLink} href="/dashboard" colorScheme="white" variant="outline" size="lg">
            Ir al panel
          </Button>
          <Button as={NextLink} href={"/weddings/demo-wedding" as Route} colorScheme="blackAlpha" size="lg">
            Ver demo pública
          </Button>
        </Stack>
      </Stack>
      <Box flex={1} w="full">
        <Box
          bg="whiteAlpha.200"
          rounded="xl"
          p={6}
          backdropFilter="blur(4px)"
          border="1px solid rgba(255,255,255,0.25)"
          boxShadow="lg"
        >
          <Text fontWeight="bold" mb={3}>
            ¿Cómo funciona?
          </Text>
          <Text>1. Crea tu boda y agrega regalos o fondos.</Text>
          <Text>2. Comparte el enlace público con tus invitados.</Text>
          <Text>3. Recibe reservas o aportes con pago online o transferencia.</Text>
        </Box>
      </Box>
    </Flex>
  );
}

