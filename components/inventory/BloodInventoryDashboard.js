import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Text,
  Flex,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Progress,
  Stack,
  Divider,
  Icon
} from '@chakra-ui/react';
import { 
  FiAlertTriangle, 
  FiBarChart2, 
  FiCalendar, 
  FiClock, 
  FiDroplet, 
  FiThermometer 
} from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Pie, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

const BloodInventoryDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryData, setInventoryData] = useState({
    byBloodType: {},
    byStatus: {},
    criticalLevels: [],
    expiringUnits: { soon: 0, veryClose: 0 },
    temperatureAlerts: []
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const alertBgColor = useColorModeValue('red.50', 'red.900');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/inventory/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch inventory data');
        }
        
        const data = await response.json();
        setInventoryData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching inventory data:', err);
        setError('Failed to load inventory data. Please try again later.');
        
        // Set some mock data for development and testing
        setInventoryData({
          byBloodType: {
            'A+': 45,
            'A-': 12,
            'B+': 38,
            'B-': 10,
            'AB+': 15,
            'AB-': 8,
            'O+': 60,
            'O-': 22
          },
          byStatus: {
            'Available': 150,
            'Reserved': 20,
            'Quarantined': 30,
            'Discarded': 5,
            'Transfused': 40,
            'Expired': 10
          },
          criticalLevels: [
            { bloodType: 'AB-', count: 8 },
            { bloodType: 'B-', count: 10 }
          ],
          expiringUnits: {
            soon: 15,
            veryClose: 5
          },
          temperatureAlerts: [
            {
              location: 'Main Facility - Refrigerator 1',
              currentTemp: 8.2,
              minTemp: 2,
              maxTemp: 8,
              status: 'Warning'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const bloodTypeChartData = {
    labels: Object.keys(inventoryData.byBloodType),
    datasets: [
      {
        data: Object.values(inventoryData.byBloodType),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#8AC926', '#1982C4'
        ],
        borderColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
          '#9966FF', '#FF9F40', '#8AC926', '#1982C4'
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusChartData = {
    labels: Object.keys(inventoryData.byStatus),
    datasets: [
      {
        data: Object.values(inventoryData.byStatus),
        backgroundColor: [
          '#4CAF50', '#FFC107', '#F44336', '#9C27B0', '#2196F3', '#607D8B'
        ],
        borderColor: [
          '#4CAF50', '#FFC107', '#F44336', '#9C27B0', '#2196F3', '#607D8B'
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: textColor,
          padding: 10,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} units`;
          }
        }
      }
    },
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>Blood Inventory Dashboard</Heading>
      
      {/* Critical Alerts */}
      {inventoryData.criticalLevels && inventoryData.criticalLevels.length > 0 && (
        <Alert 
          status="error" 
          variant="solid" 
          borderRadius="md" 
          mb={6}
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems="flex-start"
        >
          <AlertIcon boxSize="24px" mr={2} />
          <Box>
            <AlertTitle fontSize="lg" mb={2}>Critical Blood Levels Alert</AlertTitle>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              {inventoryData.criticalLevels.map((item, index) => (
                <Box key={index} bg={alertBgColor} p={3} borderRadius="md">
                  <Text fontWeight="bold">{item.bloodType}</Text>
                  <Text>Only {item.count} units remaining</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </Alert>
      )}

      {/* Temperature Alerts */}
      {inventoryData.temperatureAlerts && inventoryData.temperatureAlerts.length > 0 && (
        <Alert 
          status="warning" 
          variant="solid" 
          borderRadius="md" 
          mb={6}
          flexDirection={{ base: 'column', md: 'row' }}
          alignItems="flex-start"
        >
          <Icon as={FiThermometer} boxSize="24px" mr={2} />
          <Box>
            <AlertTitle fontSize="lg" mb={2}>Storage Temperature Alerts</AlertTitle>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {inventoryData.temperatureAlerts.map((alert, index) => (
                <Box key={index} bg="yellow.100" color="yellow.800" p={3} borderRadius="md">
                  <Text fontWeight="bold">{alert.location}</Text>
                  <Text>Current: {alert.currentTemp}°C (Range: {alert.minTemp}°C to {alert.maxTemp}°C)</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </Alert>
      )}

      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={bgColor} boxShadow="md" borderRadius="lg">
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Total Inventory</Heading>
              <Icon as={FiBarChart2} boxSize="24px" color="blue.500" />
            </Flex>
          </CardHeader>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatNumber fontSize="3xl">
                  {Object.values(inventoryData.byBloodType).reduce((a, b) => a + b, 0)}
                </StatNumber>
                <StatLabel>Blood Units</StatLabel>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>

        <Card bg={bgColor} boxShadow="md" borderRadius="lg">
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Available Units</Heading>
              <Icon as={FiDroplet} boxSize="24px" color="green.500" />
            </Flex>
          </CardHeader>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatNumber fontSize="3xl">
                  {inventoryData.byStatus?.Available || 0}
                </StatNumber>
                <StatLabel>Ready for Use</StatLabel>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>

        <Card bg={bgColor} boxShadow="md" borderRadius="lg">
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Expiring Soon</Heading>
              <Icon as={FiCalendar} boxSize="24px" color="orange.500" />
            </Flex>
          </CardHeader>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatNumber fontSize="3xl">
                  {inventoryData.expiringUnits?.soon || 0}
                </StatNumber>
                <StatLabel>Within 7 Days</StatLabel>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>

        <Card bg={bgColor} boxShadow="md" borderRadius="lg">
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md">Critical Expiry</Heading>
              <Icon as={FiAlertTriangle} boxSize="24px" color="red.500" />
            </Flex>
          </CardHeader>
          <CardBody>
            <StatGroup>
              <Stat>
                <StatNumber fontSize="3xl">
                  {inventoryData.expiringUnits?.veryClose || 0}
                </StatNumber>
                <StatLabel>Within 48 Hours</StatLabel>
              </Stat>
            </StatGroup>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} mb={8}>
        <Card bg={bgColor} boxShadow="md" borderRadius="lg">
          <CardHeader>
            <Heading size="md">Inventory by Blood Type</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Doughnut data={bloodTypeChartData} options={chartOptions} />
            </Box>
          </CardBody>
        </Card>

        <Card bg={bgColor} boxShadow="md" borderRadius="lg">
          <CardHeader>
            <Heading size="md">Inventory by Status</Heading>
          </CardHeader>
          <CardBody>
            <Box h="300px">
              <Pie data={statusChartData} options={chartOptions} />
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Blood Type Detailed Breakdown */}
      <Card bg={bgColor} boxShadow="md" borderRadius="lg" mb={8}>
        <CardHeader>
          <Heading size="md">Blood Type Inventory Levels</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {Object.entries(inventoryData.byBloodType).map(([type, count]) => {
              // Calculate percentage (assuming max capacity)
              const maxCapacity = 100; // This would ideally come from settings
              const percentage = (count / maxCapacity) * 100;
              let colorScheme = "green";
              
              if (percentage < 15) colorScheme = "red";
              else if (percentage < 30) colorScheme = "orange";
              
              return (
                <Box key={type}>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="bold">Type {type}</Text>
                    <Text>{count} units</Text>
                  </Flex>
                  <Progress 
                    value={percentage} 
                    colorScheme={colorScheme}
                    size="md"
                    borderRadius="md"
                  />
                </Box>
              );
            })}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default BloodInventoryDashboard;