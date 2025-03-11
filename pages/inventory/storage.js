import { useState } from 'react';
import { Box, Heading, Button, HStack, Grid, GridItem, useDisclosure } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import Layout from '../../components/Layout';
import StorageUnitsList from '../../components/inventory/StorageUnitsList';
import StorageTemperatureChart from '../../components/inventory/StorageTemperatureChart';
import StorageAlerts from '../../components/inventory/StorageAlerts';
import AddStorageUnitModal from '../../components/inventory/AddStorageUnitModal';

export default function StorageManagementPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Layout title="Storage Management">
      <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
        <HStack justifyContent="space-between" mb={6}>
          <Heading as="h1" size="xl">
            Storage Management
          </Heading>
          <Button 
            leftIcon={<FaPlus />} 
            colorScheme="blue" 
            onClick={onOpen}
          >
            Add Storage Unit
          </Button>
        </HStack>
        
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6} mb={8}>
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <StorageTemperatureChart />
          </GridItem>
          <GridItem colSpan={1}>
            <StorageAlerts />
          </GridItem>
        </Grid>
        
        <StorageUnitsList isLoading={isLoading} />
        
        <AddStorageUnitModal 
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
