import { useState } from 'react';
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Text } from '@chakra-ui/react';
import Layout from '../../components/Layout';
import InventoryReportGenerator from '../../components/inventory/InventoryReportGenerator';
import BloodSupplyTrends from '../../components/inventory/BloodSupplyTrends';
import ExpiryReport from '../../components/inventory/ExpiryReport';
import StorageConditionsReport from '../../components/inventory/StorageConditionsReport';

export default function ReportsPage() {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <Layout title="Inventory Reports">
      <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
        <Heading as="h1" size="xl" mb={6}>
          Inventory Reports & Analytics
        </Heading>
        
        <Text mb={8} fontSize="lg">
          Generate comprehensive reports on blood inventory, expiration tracking, and storage conditions.
          These analytics help optimize blood bank operations and ensure adequate blood supply.
        </Text>
        
        <Tabs variant="enclosed" colorScheme="green" onChange={(index) => setTabIndex(index)}>
          <TabList>
            <Tab>Report Generator</Tab>
            <Tab>Blood Supply Trends</Tab>
            <Tab>Expiry Analytics</Tab>
            <Tab>Storage Conditions</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <InventoryReportGenerator />
            </TabPanel>
            <TabPanel>
              <BloodSupplyTrends />
            </TabPanel>
            <TabPanel>
              <ExpiryReport />
            </TabPanel>
            <TabPanel>
              <StorageConditionsReport />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Layout>
  );
}
