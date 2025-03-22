import { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Spinner,
  Flex
} from '@chakra-ui/react';
import Layout from '../../components/Layout';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const InventoryPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to blood-units page instead of showing dashboard
  useEffect(() => {
    if (status !== 'loading') {
      if (session) {
        router.push('/inventory/blood-units');
      }
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        </Container>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Heading as="h1" size="xl" mb={6}>
            Blood Inventory Management
          </Heading>
          <Text>Please sign in to access this page.</Text>
        </Container>
      </Layout>
    );
  }

  // This will show briefly before redirect happens
  return (
    <Layout>
      <Container maxW="container.xl" py={6}>
        <Heading as="h1" size="xl" mb={6}>
          Blood Inventory Management
        </Heading>
        <Flex justify="center" align="center" h="300px">
          <Spinner size="xl" color="blue.500" />
          <Text ml={4}>Redirecting to Blood Units...</Text>
        </Flex>
      </Container>
    </Layout>
  );
};

export default InventoryPage;