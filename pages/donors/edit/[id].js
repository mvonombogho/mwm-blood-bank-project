import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import axios from 'axios';
import DonorForm from '../../../components/donors/DonorForm';

const EditDonorPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchDonor = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/donors/${id}`);
        setDonor(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching donor:', error);
        setError('Failed to load donor information');
        toast({
          title: 'Error',
          description: 'Failed to load donor information',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDonor();
  }, [id, toast]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={6}>
        <Flex align="center" mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => router.push('/donors')}
            size="sm"
          >
            Back to Donors
          </Button>
        </Flex>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Heading size="md" mt={4}>Loading donor information...</Heading>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={6}>
        <Flex align="center" mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => router.push('/donors')}
            size="sm"
          >
            Back to Donors
          </Button>
        </Flex>
        <Box textAlign="center" py={10}>
          <Heading size="md" color="red.500">{error}</Heading>
          <Button
            mt={4}
            colorScheme="blue"
            onClick={() => router.push('/donors')}
          >
            Return to Donors List
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Flex align="center" mb={6}>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          onClick={() => router.push('/donors')}
          size="sm"
        >
          Back to Donors
        </Button>
      </Flex>
      
      <DonorForm donorId={id} initialData={donor} />
    </Container>
  );
};

export default EditDonorPage;