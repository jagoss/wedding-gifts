"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Box, Button, Container, Grid, GridItem, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { NavBar } from "@/ui/components/NavBar";
import { Hero } from "@/ui/components/Hero";

export default function HomePage() {
  const [slug, setSlug] = useState("");
  const targetSlug = slug || "demo-wedding";

  return (
    <>
      <NavBar />
      <Container maxW="6xl" py={10}>
        <Hero />

        <Box bg="white" rounded="xl" p={{ base: 5, md: 6 }} mt={10} boxShadow="sm" border="1px solid" borderColor="gray.100">
          <Heading size="md" mb={3}>
            Encuentra la boda por enlace
          </Heading>
          <Stack direction={{ base: "column", md: "row" }} spacing={3}>
            <Input
              placeholder="ej: juan-y-ana-2026"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              bg="gray.50"
            />
            <Button
              as={NextLink}
              href={{ pathname: "/weddings/[slug]", query: { slug: targetSlug } }}
              colorScheme="purple"
            >
              Abrir
            </Button>
          </Stack>
          <Text mt={2} fontSize="sm" color="gray.500">
            En la demo usa el slug <code>demo-wedding</code>.
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mt={10}>
          <GridItem>
            <FeatureCard title="Listados claros" description="Regalos y fondos con estados disponibles, reservados o comprados." />
          </GridItem>
          <GridItem>
            <FeatureCard title="Pagos online o transferencia" description="El invitado elige cómo aportar; tú ves el estado en el panel." />
          </GridItem>
          <GridItem>
            <FeatureCard title="Diseño responsive" description="Pensado para desktop y móvil, sin sacrificar usabilidad." />
          </GridItem>
        </Grid>
      </Container>
    </>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Box bg="white" rounded="lg" p={5} border="1px solid" borderColor="gray.100" boxShadow="xs">
      <Heading size="sm" mb={2}>
        {title}
      </Heading>
      <Text color="gray.600">{description}</Text>
    </Box>
  );
}

