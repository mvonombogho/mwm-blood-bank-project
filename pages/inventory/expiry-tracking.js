import { useState } from 'react';
import { Container, Heading, Box, Text, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import Layout from '../../components/Layout';
import ExpiryCalendar from '../../components/inventory/ExpiryCalendar';
import ExpiredUnitsManager from '../../components/inventory/ExpiredUnitsManager';
import { useSession } from 'next-auth/react';

const ExpiryTrackingPage = () => {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState(0);

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
            Expiry Tracking
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
          Expiry Tracking
        </Heading>
        
        <Tabs isFitted variant="enclosed" colorScheme="blue" index={activeTab} onChange={setActiveTab}>
          <TabList mb={6}>
            <Tab>Upcoming Expirations</Tab>
            <Tab>Expired Units Management</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel px={0}>
              <ExpiryCalendar />
            </TabPanel>
            
            <TabPanel px={0}>
              <ExpiredUnitsManager />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Layout>
  );
};

export default ExpiryTrackingPage;
