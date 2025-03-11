import { Container, Heading, Box, Text } from '@chakra-ui/react';
import Layout from '../../components/Layout';
import ExpiryCalendar from '../../components/inventory/ExpiryCalendar';
import { useSession } from 'next-auth/react';

const ExpiryTrackingPage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Text>Loading...</Text>
        </Container>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Heading as="h1" size="xl" mb={6}>
            Expiry Tracking
          </Heading>
          <Text>Please sign in to access this page.</Text>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={6}>
        <Heading as="h1" size="xl" mb={6}>
          Expiry Tracking
        </Heading>
        <ExpiryCalendar />
      </Container>
    </Layout>
  );
};

export default ExpiryTrackingPage;
