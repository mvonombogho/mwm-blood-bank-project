import { Box } from '@chakra-ui/react';
import RecipientList from '@/components/recipients/RecipientList';

const RecipientsPage = () => {
  return (
    <Box maxW="container.xl" mx="auto" py={6}>
      <RecipientList />
    </Box>
  );
};

export default RecipientsPage;