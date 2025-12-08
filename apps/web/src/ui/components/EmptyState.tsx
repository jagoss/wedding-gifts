"use client";

import { Box, Stack, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  return (
    <Box border="1px dashed" borderColor="gray.200" rounded="lg" p={6} textAlign="center" bg="white">
      <Stack spacing={3} align="center">
        <Text fontWeight="bold" color="gray.700">
          {title}
        </Text>
        {description && (
          <Text color="gray.500" maxW="2xl">
            {description}
          </Text>
        )}
        {action}
      </Stack>
    </Box>
  );
}

