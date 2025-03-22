import { Box, Heading, Text, Container, Button } from '@chakra-ui/react';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';

export default function ReportsRemoved() {
  const router = useRouter();

  return (
    <Layout title="Inventory Management">
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10} px={6}>
          <Heading as="h2" size="xl" mt={6} mb={4}>
            Reports Feature Unavailable
          </Heading>
          <Text color={'gray.500'} mb={6}>
            The reports feature has been temporarily removed from the Blood Bank Management System.
            Please check back later for updated functionality.
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => router.push('/inventory')}
            mb={8}
          >
            Return to Inventory
          </Button>
        </Box>
      </Container>
    </Layout>
  );
}