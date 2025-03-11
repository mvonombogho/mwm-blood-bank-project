import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Button,
  Flex,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DonorForm from '../../../components/donors/DonorForm';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

const EditDonorPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [donor, setDonor] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (id) {
      const fetchDonor = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/donors/${id}`);
          setDonor(response.data);
        } catch (error) {
          toast({
            title: 'Error fetching donor data',
            description: error.response?.data?.message || 'Could not load donor information',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          router.push('/donors');
        } finally {
          setLoading(false);
        }
      };

      fetchDonor();
    }
  }, [id, router, toast]);

  return (
    <ProtectedRoute requiredPermission="canManageDonors">
      <Container maxW="container.xl" py={6}>
        <Flex align="center" mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => router.push(`/donors/${id}`)}
            size="sm"
          >
            Back to Donor Details
          </Button>
        </Flex>

        {id && <DonorForm donorId={id} initialData={donor} />}
      </Container>
    </ProtectedRoute>
  );
};

export default EditDonorPage;
