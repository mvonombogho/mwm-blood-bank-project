import { useState, useEffect } from 'react';
import { Box, Heading, Button, Flex, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import AddDonorForm from '@/components/donors/AddDonorForm';

const EditDonorPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (id) {
      fetchDonor();
    }
  }, [id]);

  const fetchDonor = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would be:
      // const response = await fetch(`/api/donors/${id}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch donor details');
      // }
      // const data = await response.json();
      // setDonor(data.data);
      
      // For now, we'll simulate with mock data
      const mockDonor = {
        _id: id,
        donorId: 'D221001',
        firstName: 'John',
        lastName: 'Doe',
        gender: 'Male',
        dateOfBirth: '1985-05-15', // Format for form input
        bloodType: 'O+',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        address: {
          street: '123 Main Street',
          city: 'Anytown',
          state: 'CA',
          zipCode: '90001',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '555-987-6543'
        },
        status: 'Active',
        communicationPreferences: {
          email: true,
          sms: true,
          phone: true,
          post: false
        },
        notes: 'Regular donor, prefers morning appointments.'
      };
      
      // Simulate API delay
      setTimeout(() => {
        setDonor(mockDonor);
        setLoading(false);
      }, 500);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  return (
    <Box maxW="container.xl" mx="auto" py={6}>
      <Flex mb={6} alignItems="center">
        <Button 
          leftIcon={<ArrowBackIcon />} 
          variant="ghost" 
          onClick={() => router.push(`/donors/${id}`)}
          mr={4}
        >
          Back to Details
        </Button>
        <Heading size="lg">Edit Donor</Heading>
      </Flex>
      
      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Text color="red.500">Error: {error}</Text>
      ) : donor ? (
        <AddDonorForm existingDonor={donor} />
      ) : null}
    </Box>
  );
};

export default EditDonorPage;