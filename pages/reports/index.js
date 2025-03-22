import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Heading, Text, Container, Button } from '@chakra-ui/react';
import MainLayout from '../../components/layout/MainLayout';

// Reports page component
export default function Reports() {
  const router = useRouter();
  
  // Redirect to home page after a brief delay
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/');
    }, 5000);
    
    // Clean up timer on unmount
    return () => clearTimeout(redirectTimer);
  }, [router]);
  
  return (
    <MainLayout>
      <Container maxW="container.md" py={10}>
        <Box textAlign="center" p={8} bg="white" borderRadius="md" boxShadow="md">
          <Heading as="h1" size="xl" mb={6}>Reports Feature</Heading>
          <Text fontSize="lg" mb={6}>
            The reports feature has been deprecated and is no longer available.
          </Text>
          <Text mb={8}>
            You will be redirected to the dashboard automatically in a few seconds.
          </Text>
          <Button 
            colorScheme="blue" 
            onClick={() => router.push('/')}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
}
