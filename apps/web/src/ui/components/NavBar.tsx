"use client";

import NextLink from "next/link";
import { Box, Button, Flex, HStack, Spacer, Text } from "@chakra-ui/react";
import { useSession } from "@/ui/session/SessionProvider";

export function NavBar() {
  const { user, logout } = useSession();

  return (
    <Box as="nav" bg="whiteAlpha.900" px={6} py={4} boxShadow="sm" position="sticky" top={0} zIndex={10}>
      <Flex align="center" gap={4}>
        <NextLink href="/">
          <Text fontWeight="bold" color="purple.600">
            Wedding Gifts
          </Text>
        </NextLink>
        <HStack spacing={4}>
          <NextLink href="/dashboard">Panel</NextLink>
          <NextLink href="/weddings/demo-wedding">Ejemplo público</NextLink>
        </HStack>
        <Spacer />
        {user ? (
          <HStack spacing={3}>
            <Text fontSize="sm" color="gray.600">
              {user.name}
            </Text>
            <Button size="sm" variant="outline" onClick={logout}>
              Salir
            </Button>
          </HStack>
        ) : (
          <Button as={NextLink} href="/login" size="sm" colorScheme="purple">
            Ingresar
          </Button>
        )}
      </Flex>
    </Box>
  );
}

