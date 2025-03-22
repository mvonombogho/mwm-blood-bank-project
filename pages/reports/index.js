import { Box, Heading, Text, Container, Button } from '@chakra-ui/react';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';

export default function ReportsDisabled() {
  const router = useRouter();

  return (
    <Layout title="Reports">
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center" py={10} px={6}>
          <Heading as="h2" size="xl" mt={6} mb={4}>
            Reports Feature Temporarily Disabled
          </Heading>
          <Text color={'gray.500'} mb={6}>
            The reports functionality has been temporarily disabled in the Blood Bank Management System.
            We're working on improving this feature and it will be available again in a future update.
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => router.push('/')}
            mb={8}
          >
            Return to Dashboard
          </Button>
        </Box>
      </Container>
    </Layout>
  );
}