import { Container, Heading, Box, Text } from '@chakra-ui/react';
import Layout from '../../components/Layout';
import EnhancedBloodUnitManagement from '../../components/inventory/EnhancedBloodUnitManagement';
import { useSession } from 'next-auth/react';

const BloodUnitsPage = () => {
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
            Blood Units Management
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
          Blood Units Management
        </Heading>
        <EnhancedBloodUnitManagement />
      </Container>
    </Layout>
  );
};

export default BloodUnitsPage;
