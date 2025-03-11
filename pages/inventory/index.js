import { useState } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Tabs, TabList, TabPanels, Tab, TabPanel, useColorModeValue } from '@chakra-ui/react';
import { FaVial, FaThermometerHalf, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import Layout from '../../components/Layout';
import BloodInventoryDashboard from '../../components/inventory/BloodInventoryDashboard';
import StorageManagement from '../../components/inventory/StorageManagement';
import InventoryAlerts from '../../components/inventory/InventoryAlerts';
import ExpiryTracking from '../../components/inventory/ExpiryTracking';

export default function InventoryManagement() {
  const [tabIndex, setTabIndex] = useState(0);
  const bgColor = useColorModeValue('white', 'gray.800');
  const statBg = useColorModeValue('gray.100', 'gray.700');

  // This would be replaced with actual data from an API call
  const inventorySummary = {
    totalUnits: 253,
    expiringUnits: 12,
    criticalTypes: ['O-', 'AB-'],
    alertCount: 3,
    bloodTypes: {
      'A+': 45,
      'A-': 22,
      'B+': 38,
      'B-': 15,
      'AB+': 12,
      'AB-': 8,
      'O+': 65,
      'O-': 48
    }
  };

  const StatCard = ({ icon, label, value, helpText, colorScheme }) => (
    <Stat
      px={{ base: 2, md: 4 }}
      py='5'
      shadow='sm'
      border='1px solid'
      borderColor={useColorModeValue('gray.200', 'gray.500')}
      rounded='lg'
      backgroundColor={statBg}
    >
      <Box d='flex' alignItems='center'>
        <Box
          my='auto'
          color={`${colorScheme}.500`}
          alignContent='center'
        >
          {icon}
        </Box>
        <Box pl={{ base: 2, md: 4 }}>
          <StatLabel fontWeight='medium'>{label}</StatLabel>
          <StatNumber fontSize='2xl' fontWeight='medium'>
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText>
              {helpText}
            </StatHelpText>
          )}
        </Box>
      </Box>
    </Stat>
  );

  return (
    <Layout title="Inventory Management">
      <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
        <Heading as="h1" size="xl" mb={6}>
          Blood Inventory Management
        </Heading>
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 5, lg: 8 }} mb={10}>
          <StatCard
            icon={<FaVial size="3em" />}
            label="Total Blood Units"
            value={inventorySummary.totalUnits}
            helpText="Available for transfusion"
            colorScheme="red"
          />
          <StatCard
            icon={<FaThermometerHalf size="3em" />}
            label="Storage Status"
            value="Normal"
            helpText="All fridges operational"
            colorScheme="blue"
          />
          <StatCard
            icon={<FaExclamationTriangle size="3em" />}
            label="Critical Types"
            value={inventorySummary.criticalTypes.join(', ')}
            helpText="Low inventory alert"
            colorScheme="orange"
          />
          <StatCard
            icon={<FaClock size="3em" />}
            label="Expiring Soon"
            value={inventorySummary.expiringUnits}
            helpText="Within next 7 days"
            colorScheme="purple"
          />
        </SimpleGrid>

        <Tabs variant="enclosed" colorScheme="red" onChange={(index) => setTabIndex(index)}>
          <TabList>
            <Tab>Blood Inventory</Tab>
            <Tab>Storage Management</Tab>
            <Tab>Alerts & Reports</Tab>
            <Tab>Expiry Tracking</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel>
              <BloodInventoryDashboard />
            </TabPanel>
            <TabPanel>
              <StorageManagement />
            </TabPanel>
            <TabPanel>
              <InventoryAlerts />
            </TabPanel>
            <TabPanel>
              <ExpiryTracking />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Layout>
  );
}
