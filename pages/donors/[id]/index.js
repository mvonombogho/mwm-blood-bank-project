import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Button,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import DonorDetail from '../../../components/donors/DonorDetail';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';

const DonorDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
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
        
        {id && <DonorDetail donorId={id} />}
      </Container>
    </ProtectedRoute>
  );
};

export default DonorDetailPage;
