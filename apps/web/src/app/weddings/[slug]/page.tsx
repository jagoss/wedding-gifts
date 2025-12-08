"use client";

import { useParams } from "next/navigation";
import { Box, Container, Grid, GridItem, Heading, Stack, Text } from "@chakra-ui/react";
import { NavBar } from "@/ui/components/NavBar";
import { WeddingHeader } from "@/ui/components/WeddingHeader";
import { GiftCard } from "@/ui/components/GiftCard";
import { ContributionForm } from "@/ui/components/ContributionForm";
import { LoadingState } from "@/ui/components/LoadingState";
import { EmptyState } from "@/ui/components/EmptyState";
import { usePublicWedding } from "@/ui/hooks/usePublicWedding";

export default function PublicWeddingPage() {
  const params = useParams<{ slug: string }>() ?? { slug: "" };
  const slug = params.slug;
  const { data, isLoading, isError, error } = usePublicWedding(slug);

  return (
    <>
      <NavBar />
      <Container maxW="6xl" py={10}>
        {isLoading && <LoadingState label="Cargando boda..." />}
        {isError && (
          <Box bg="white" p={6} rounded="md" border="1px solid" borderColor="red.100">
            <Heading size="sm" color="red.600" mb={2}>
              No pudimos cargar esta boda
            </Heading>
            <Text color="gray.600">{(error as Error).message}</Text>
          </Box>
        )}
        {data && (
          <Stack spacing={8}>
            <WeddingHeader wedding={data.wedding} />
            <Box>
              <Heading size="md" mb={4}>
                Regalos y fondos
              </Heading>
              {data.gifts.length === 0 ? (
                <EmptyState
                  title="Aún no hay regalos en la lista"
                  description="El organizador agregará opciones pronto."
                />
              ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  {data.gifts.map((gift) => (
                    <GridItem key={gift.id}>
                      <Stack spacing={4} bg="white" p={4} rounded="md" border="1px solid" borderColor="gray.100">
                        <GiftCard gift={{ ...gift, weddingId: data.wedding.id, maxContributions: null }} />
                        <ContributionForm slug={slug} giftId={gift.id} />
                      </Stack>
                    </GridItem>
                  ))}
                </Grid>
              )}
            </Box>
          </Stack>
        )}
      </Container>
    </>
  );
}

