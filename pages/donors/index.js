import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@chakra-ui/react';
import DonorDashboard from '../../components/donors/DonorDashboard';
import DonorList from '../../components/donors/DonorList';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const DonorsPage = () => {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <ProtectedRoute requiredPermission="canManageDonors">
      <Container maxW="container.xl" py={6}>
        <Heading size="lg" mb={6}>Donor Management</Heading>
        
        <Tabs
          colorScheme="blue"
          index={tabIndex}
          onChange={(index) => setTabIndex(index)}
          isLazy
        >
          <TabList>
            <Tab>Dashboard</Tab>
            <Tab>Donor List</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              <DonorDashboard />
            </TabPanel>
            
            <TabPanel px={0}>
              <DonorList />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </ProtectedRoute>
  );
};

export default DonorsPage;
