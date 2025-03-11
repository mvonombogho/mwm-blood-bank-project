import { useState } from 'react';
import { Box, Heading, Button, HStack, useDisclosure } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import Layout from '../../components/Layout';
import BloodUnitsList from '../../components/inventory/BloodUnitsList';
import AddBloodUnitModal from '../../components/inventory/AddBloodUnitModal';

export default function BloodUnits() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Layout title="Blood Units Inventory">
      <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
        <HStack justifyContent="space-between" mb={6}>
          <Heading as="h1" size="xl">
            Blood Units Inventory
          </Heading>
          <Button 
            leftIcon={<FaPlus />} 
            colorScheme="red" 
            onClick={onOpen}
          >
            Add Blood Unit
          </Button>
        </HStack>
        
        <BloodUnitsList isLoading={isLoading} />
        
        <AddBloodUnitModal 
          isOpen={isOpen} 
          onClose={onClose} 
          onSuccess={() => {
            // Refresh the list after successful addition
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 500); // Simulated refresh
          }} 
        />
      </Box>
    </Layout>
  );
}
