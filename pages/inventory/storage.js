import { Container, Heading, Box, Text } from '@chakra-ui/react';
import Layout from '../../components/Layout';
import StorageManagement from '../../components/inventory/StorageManagement';
import { useSession } from 'next-auth/react';

const StoragePage = () => {
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
            Storage Management
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
          Storage Management
        </Heading>
        <StorageManagement />
      </Container>
    </Layout>
  );
};

export default StoragePage;
