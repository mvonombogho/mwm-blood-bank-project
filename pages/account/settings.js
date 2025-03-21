import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';

// This page redirects to the settings page
export default function AccountSettingsRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main settings page
    router.replace('/settings');
  }, [router]);

  return (
    <Center minH="100vh" p={5}>
      <Box textAlign="center">
        <Spinner size="xl" mb={4} />
        <Text>Redirecting to Settings...</Text>
      </Box>
    </Center>
  );
}
