import { useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
  Heading,
  Text
} from '@chakra-ui/react';
import Layout from '../../components/Layout';
import BloodInventoryDashboard from '../../components/inventory/BloodInventoryDashboard';
import { useSession } from 'next-auth/react';

const InventoryDashboardPage = () => {
  const { data: session, status } = useSession();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabsChange = (index) => {
    setTabIndex(index);
  };

  if (status === 'loading') {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Text>Loading...</Text>
        </Container>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Heading as="h1" size="xl" mb={6}>
            Blood Inventory Management
          </Heading>
          <Text>Please sign in to access this page.</Text>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxW="container.xl" py={6}>
        <Heading as="h1" size="xl" mb={6}>
          Blood Inventory Management
        </Heading>
        
        <Tabs 
          isFitted 
          variant="enclosed" 
          colorScheme="blue" 
          index={tabIndex} 
          onChange={handleTabsChange}
          isLazy
        >
          <TabList mb={4}>
            <Tab>Dashboard</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <BloodInventoryDashboard />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Layout>
  );
};

export default InventoryDashboardPage;
