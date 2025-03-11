import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Button,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import DonorForm from '../../components/donors/DonorForm';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const AddDonorPage = () => {
  const router = useRouter();

  return (
    <ProtectedRoute requiredPermission="canManageDonors">
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
        
        <DonorForm />
      </Container>
    </ProtectedRoute>
  );
};

export default AddDonorPage;
