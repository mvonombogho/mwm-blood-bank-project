import { useState, useEffect } from 'react';
import { Box, Heading, Button, Flex, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import AddRecipientForm from '@/components/recipients/AddRecipientForm';

const EditRecipientPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (id) {
      fetchRecipient();
    }
  }, [id]);

  const fetchRecipient = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipients/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipient details');
      }
      const data = await response.json();
      
      // Format date for form input
      if (data.data.dateOfBirth) {
        const dateObj = new Date(data.data.dateOfBirth);
        data.data.dateOfBirth = dateObj.toISOString().split('T')[0];
      }
      
      setRecipient(data.data);
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
          onClick={() => router.push(`/recipients/${id}`)}
          mr={4}
        >
          Back to Details
        </Button>
        <Heading size="lg">Edit Recipient</Heading>
      </Flex>
      
      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Text color="red.500">Error: {error}</Text>
      ) : recipient ? (
        <AddRecipientForm existingRecipient={recipient} />
      ) : null}
    </Box>
  );
};

export default EditRecipientPage;