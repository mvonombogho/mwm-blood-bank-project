import { Box, Heading, Button, Flex } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import AddDonorForm from '@/components/donors/AddDonorForm';

const AddDonorPage = () => {
  const router = useRouter();

  return (
    <Box maxW="container.xl" mx="auto" py={6}>
      <Flex mb={6} alignItems="center">
        <Button 
          leftIcon={<ArrowBackIcon />} 
          variant="ghost" 
          onClick={() => router.push('/donors')}
          mr={4}
        >
          Back to List
        </Button>
        <Heading size="lg">Add New Donor</Heading>
      </Flex>
      
      <AddDonorForm />
    </Box>
  );
};

export default AddDonorPage;