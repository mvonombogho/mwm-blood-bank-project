import { Box } from '@chakra-ui/react';
import DonorList from '@/components/donors/DonorList';

const DonorsPage = () => {
  return (
    <Box maxW="container.xl" mx="auto" py={6}>
      <DonorList />
    </Box>
  );
};

export default DonorsPage;