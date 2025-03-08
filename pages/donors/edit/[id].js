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
      const response = await fetch(`/api/donors/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch donor details');
      }
      const data = await response.json();
      
      // Format date for form input
      if (data.data.dateOfBirth) {
        const dateObj = new Date(data.data.dateOfBirth);
        data.data.dateOfBirth = dateObj.toISOString().split('T')[0];
      }
      
      setDonor(data.data);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
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