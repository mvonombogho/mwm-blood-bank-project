import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
  Flex,
  Badge,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  Icon,
  VStack,
  Button,
} from '@chakra-ui/react';
import { 
  FaVial, 
  FaThermometerHalf, 
  FaExclamationTriangle,
  FaCalendarTimes 
} from 'react-icons/fa';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const BloodTypeColors = {
  'A+': 'red.500',
  'A-': 'red.300',
  'B+': 'blue.500',
  'B-': 'blue.300',
  'AB+': 'purple.500',
  'AB-': 'purple.300',
  'O+': 'green.500',
  'O-': 'green.300',
};

const InventoryDashboard = () => {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    expiring: 0,
    byType: {},
    byStatus: {},
  });

  // Colors for the charts
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  useEffect(() => {
    const fetchBloodUnits = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/inventory/blood-units');
        const data = response.data;
        setBloodUnits(data);
        
        // Calculate statistics
        const total = data.length;
        const available = data.filter(unit => unit.status === 'Available').length;
        const today = new Date();
        const expiring = data.filter(unit => {
          const expiryDate = new Date(unit.expirationDate);
          return differenceInDays(expiryDate, today) <= 7 && 
                 differenceInDays(expiryDate, today) >= 0 &&
                 unit.status === 'Available';
        }).length;

        // Group by blood type
        const byType = data.reduce((acc, unit) => {
          if (unit.status === 'Available') {
            acc[unit.bloodType] = (acc[unit.bloodType] || 0) + 1;
          }
          return acc;
        }, {});

        // Group by status
        const byStatus = data.reduce((acc, unit) => {
          acc[unit.status] = (acc[unit.status] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total,
          available,
          expiring,
          byType,
          byStatus,
        });

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch blood units:", err);
        setError("Failed to load inventory data");
        setLoading(false);
      }
    };

    fetchBloodUnits();
  }, []);

  // Blood type chart data
  const bloodTypeData = {
    labels: Object.keys(stats.byType),
    datasets: [
      {
        data: Object.values(stats.byType),
        backgroundColor: Object.keys(stats.byType).map(type => BloodTypeColors[type] || 'gray.500'),
        borderWidth: 1,
      },
    ],
  };

  // Status chart data
  const statusData = {
    labels: Object.keys(stats.byStatus),
    datasets: [
      {
        data: Object.values(stats.byStatus),
        backgroundColor: [
          'green.400',
          'yellow.400',
          'red.400',
          'gray.400',
          'blue.400',
          'orange.400',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Calculate inventory health - a simple metric based on available units and expiring soon
  const inventoryHealth = stats.available > 0 
    ? Math.max(0, 100 - ((stats.expiring / stats.available) * 100))
    : 0;

  // Helper function to get color based on days until expiry
  const getExpiryColor = (expiryDate) => {
    const today = new Date();
    const days = differenceInDays(new Date(expiryDate), today);
    
    if (days <= 3) return 'red.500';
    if (days <= 7) return 'orange.500';
    if (days <= 14) return 'yellow.500';
    return 'green.500';
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" height="500px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>{error}</AlertTitle>
      </Alert>
    );
  }

  // Get the 5 units expiring soonest
  const expiringUnits = [...bloodUnits]
    .filter(unit => unit.status === 'Available')
    .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate))
    .slice(0, 5);

  return (
    <Box p={5}>
      <Heading mb={6}>Blood Inventory Dashboard</Heading>
      
      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Stat bg={cardBg} p={5} borderRadius="lg" boxShadow="md">
          <StatLabel>Total Units</StatLabel>
          <Flex align="center">
            <Icon as={FaVial} color="blue.500" mr={2} />
            <StatNumber>{stats.total}</StatNumber>
          </Flex>
          <StatHelpText>All blood units in system</StatHelpText>
        </Stat>
        
        <Stat bg={cardBg} p={5} borderRadius="lg" boxShadow="md">
          <StatLabel>Available Units</StatLabel>
          <Flex align="center">
            <Icon as={FaVial} color="green.500" mr={2} />
            <StatNumber>{stats.available}</StatNumber>
          </Flex>
          <StatHelpText>
            <StatArrow type={stats.available > stats.total * 0.3 ? 'increase' : 'decrease'} />
            {((stats.available / stats.total) * 100).toFixed(1)}% of total
          </StatHelpText>
        </Stat>
        
        <Stat bg={cardBg} p={5} borderRadius="lg" boxShadow="md">
          <StatLabel>Expiring Soon</StatLabel>
          <Flex align="center">
            <Icon as={FaCalendarTimes} color="red.500" mr={2} />
            <StatNumber>{stats.expiring}</StatNumber>
          </Flex>
          <StatHelpText>Units expiring within 7 days</StatHelpText>
        </Stat>
        
        <Stat bg={cardBg} p={5} borderRadius="lg" boxShadow="md">
          <StatLabel>Inventory Health</StatLabel>
          <StatNumber>{inventoryHealth.toFixed(1)}%</StatNumber>
          <Progress
            value={inventoryHealth}
            colorScheme={
              inventoryHealth > 80 ? 'green' : 
              inventoryHealth > 50 ? 'yellow' : 
              'red'
            }
            size="sm"
            mt={2}
          />
        </Stat>
      </SimpleGrid>
      
      {/* Charts */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
        <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>Blood Type Distribution</Heading>
          <Box height="250px">
            <Pie data={bloodTypeData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Box>
        
        <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>Status Distribution</Heading>
          <Box height="250px">
            <Pie data={statusData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Box>
      </SimpleGrid>
      
      {/* Expiring Soon Table */}
      <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="md" mb={8}>
        <Heading size="md" mb={4}>
          <Flex align="center">
            <Icon as={FaExclamationTriangle} color="orange.500" mr={2} />
            Units Expiring Soon
          </Flex>
        </Heading>
        
        {expiringUnits.length > 0 ? (
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Unit ID</Th>
                  <Th>Blood Type</Th>
                  <Th>Expiry Date</Th>
                  <Th>Days Left</Th>
                  <Th>Location</Th>
                </Tr>
              </Thead>
              <Tbody>
                {expiringUnits.map((unit) => {
                  const daysLeft = differenceInDays(
                    new Date(unit.expirationDate),
                    new Date()
                  );
                  return (
                    <Tr key={unit._id}>
                      <Td>{unit.unitId}</Td>
                      <Td>
                        <Badge colorScheme={
                          unit.bloodType.includes('A') ? 'red' :
                          unit.bloodType.includes('B') ? 'blue' :
                          unit.bloodType.includes('AB') ? 'purple' : 'green'
                        }>
                          {unit.bloodType}
                        </Badge>
                      </Td>
                      <Td>{format(new Date(unit.expirationDate), 'dd MMM yyyy')}</Td>
                      <Td>
                        <Badge colorScheme={
                          daysLeft <= 3 ? 'red' :
                          daysLeft <= 7 ? 'orange' : 'green'
                        }>
                          {daysLeft} days
                        </Badge>
                      </Td>
                      <Td>{`${unit.location.facility} - ${unit.location.storageUnit}`}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Alert status="info">
            <AlertIcon />
            No units expiring soon
          </Alert>
        )}
        
        <Button colorScheme="blue" size="sm" mt={4}>
          View All Inventory
        </Button>
      </Box>
    </Box>
  );
};

export default InventoryDashboard;