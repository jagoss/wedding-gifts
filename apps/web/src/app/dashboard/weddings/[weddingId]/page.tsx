"use client";

import { useParams } from "next/navigation";
import { Box, Button, Container, Grid, GridItem, Heading, Stack, Text } from "@chakra-ui/react";
import { NavBar } from "@/ui/components/NavBar";
import { LoadingState } from "@/ui/components/LoadingState";
import { EmptyState } from "@/ui/components/EmptyState";
import { GiftCard } from "@/ui/components/GiftCard";
import { CreateGiftForm } from "@/ui/components/CreateGiftForm";
import { useSession } from "@/ui/session/SessionProvider";
import { useWedding } from "@/ui/hooks/useWedding";
import { useGifts } from "@/ui/hooks/useGifts";

export default function WeddingDashboardPage() {
  const params = useParams<{ weddingId: string }>() ?? { weddingId: "" };
  const weddingId = params.weddingId;
  const { token } = useSession();

  const weddingQuery = useWedding(weddingId);
  const giftsQuery = useGifts(weddingId);

  if (!token) {
    return (
      <>
        <NavBar />
        <Container maxW="4xl" py={10}>
          <EmptyState
            title="Necesitas iniciar sesión"
            description="Accede con tu cuenta para ver esta boda."
            action={
              <Button colorScheme="purple" href="/login" as="a">
                Ingresar
              </Button>
            }
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container maxW="6xl" py={10}>
        {weddingQuery.isLoading && <LoadingState label="Cargando boda..." />}
        {weddingQuery.isError && (
          <Box bg="white" p={4} rounded="md" border="1px solid" borderColor="red.100">
            <Text color="red.600">{(weddingQuery.error as Error).message}</Text>
          </Box>
        )}
        {weddingQuery.data && (
          <Stack spacing={8}>
            <Box>
              <Heading size="lg">{weddingQuery.data.title}</Heading>
              <Text color="gray.600">{weddingQuery.data.slug}</Text>
            </Box>

            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8}>
              <GridItem>
                <Heading size="md" mb={4}>
                  Regalos
                </Heading>
                {giftsQuery.isLoading && <LoadingState label="Cargando regalos..." />}
                {giftsQuery.isError && (
                  <Box bg="white" p={4} rounded="md" border="1px solid" borderColor="red.100">
                    <Text color="red.600">{(giftsQuery.error as Error).message}</Text>
                  </Box>
                )}
                {giftsQuery.data && giftsQuery.data.length === 0 && (
                  <EmptyState
                    title="Aún no hay regalos"
                    description="Agrega regalos o fondos usando el formulario."
                  />
                )}
                {giftsQuery.data && giftsQuery.data.length > 0 && (
                  <Stack spacing={4}>
                    {giftsQuery.data.map((gift) => (
                      <GiftCard key={gift.id} gift={gift} />
                    ))}
                  </Stack>
                )}
              </GridItem>

              <GridItem>
                <Heading size="md" mb={4}>
                  Crear regalo
                </Heading>
                <Box bg="white" p={4} rounded="md" border="1px solid" borderColor="gray.100">
                  <CreateGiftForm weddingId={weddingId} />
                </Box>
              </GridItem>
            </Grid>
          </Stack>
        )}
      </Container>
    </>
  );
}

