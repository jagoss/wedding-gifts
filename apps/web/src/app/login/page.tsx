"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text
} from "@chakra-ui/react";
import { NavBar } from "@/ui/components/NavBar";
import { useSession } from "@/ui/session/SessionProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message ?? "No pudimos iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <Container maxW="lg" py={10}>
        <Box bg="white" p={6} rounded="lg" border="1px solid" borderColor="gray.100" boxShadow="sm">
          <Heading size="md" mb={1}>
            Iniciar sesión
          </Heading>
          <Text color="gray.600" mb={6}>
            Usa tu correo y contraseña de administrador.
          </Text>

          <Stack as="form" spacing={4} onSubmit={handleLogin}>
            <FormControl>
              <FormLabel>Correo</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </FormControl>
            <FormControl>
              <FormLabel>Contraseña</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormControl>
            <Button type="submit" colorScheme="purple" isLoading={loading}>
              Entrar
            </Button>
            {error && (
              <Alert status="error" rounded="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </Stack>
        </Box>
      </Container>
    </>
  );
}

