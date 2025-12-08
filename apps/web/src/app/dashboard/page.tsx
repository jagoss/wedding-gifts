"use client";

import NextLink from "next/link";
import { Box, Button, Container, Heading, Stack, Text } from "@chakra-ui/react";
import { NavBar } from "@/ui/components/NavBar";
import { EmptyState } from "@/ui/components/EmptyState";
import { LoadingState } from "@/ui/components/LoadingState";
import { useSession } from "@/ui/session/SessionProvider";
import { useWeddings } from "@/ui/hooks/useWeddings";

export default function DashboardPage() {
  const { token } = useSession();
  const { data, isLoading, isError, error } = useWeddings(Boolean(token));

  return (
    <>
      <NavBar />
      <Container maxW="6xl" py={10}>
        <Heading size="lg" mb={4}>
          Panel de bodas
        </Heading>
        {!token && (
          <EmptyState
            title="Necesitas iniciar sesión"
            description="Ingresa con tu cuenta de admin para ver y gestionar tus bodas."
            action={
              <Button as={NextLink} href="/login" colorScheme="purple">
                Ir a login
              </Button>
            }
          />
        )}
        {token && (
          <>
            {isLoading && <LoadingState label="Cargando bodas..." />}
            {isError && (
              <Box bg="white" p={4} rounded="md" border="1px solid" borderColor="red.100">
                <Text color="red.600">{(error as Error).message}</Text>
              </Box>
            )}
            {data && data.length === 0 && (
              <EmptyState
                title="Aún no tienes bodas creadas"
                description="Crea una boda desde la API o agrega un formulario aquí."
              />
            )}
            {data && data.length > 0 && (
              <Stack spacing={4}>
                {data.map((wedding) => (
                  <Box
                    key={wedding.id}
                    bg="white"
                    p={4}
                    rounded="md"
                    border="1px solid"
                    borderColor="gray.100"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Heading size="sm">{wedding.title}</Heading>
                      <Text color="gray.600">{wedding.slug}</Text>
                    </Box>
                    <Button
                      as={NextLink}
                      href={{ pathname: "/dashboard/weddings/[weddingId]", query: { weddingId: wedding.id } }}
                      colorScheme="purple"
                      size="sm"
                    >
                      Abrir
                    </Button>
                  </Box>
                ))}
              </Stack>
            )}
          </>
        )}
      </Container>
    </>
  );
}

