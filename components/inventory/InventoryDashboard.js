import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Flex,
  Badge,
  Text,
  Card,
  CardBody,
  CardHeader,
  Stack,
  Progress,
  Divider,
  Alert,
  AlertIcon,
  Skeleton,
  SkeletonText,
  Button,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiDroplet, FiAlertTriangle, FiClock, FiThermometer, FiCheckCircle, FiBarChart2 } from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import NextLink from 'next/link';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const InventoryDashboard = () => {
  const [inventoryStats, setInventoryStats] = useState(null);
  const [expiryData, setExpiryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        
        // Fetch data in parallel
        const [inventoryResponse, expiryResponse] = await Promise.all([
          axios.get('/api/inventory/blood-units/stats'),
          axios.get('/api/inventory/expiry-tracking?critical=true&limit=5')
        ]);
        
        setInventoryStats(inventoryResponse.data);
        setExpiryData(expiryResponse.data);
      } catch (err) {
        console.error('Error fetching inventory data:', err);
        setError('Failed to load inventory data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, []);

  // Prepare chart data for blood type distribution
  const bloodTypeChartData = inventoryStats ? {
    labels: Object.keys(inventoryStats.byBloodType || {}),
    datasets: [
      {
        data: Object.values(inventoryStats.byBloodType || {}),
        backgroundColor: [
          '#FF6384', // A+
          '#FF9F40', // A-
          '#FFCD56', // B+
          '#4BC0C0', // B-
          '#36A2EB', // AB+
          '#9966FF', // AB-
          '#C9CBCF', // O+
          '#7C8798', // O-
        ],
        borderWidth: 1,
      },
    ],
  } : null;

  // Prepare chart data for age distribution
  const ageDistributionData = inventoryStats ? {
    labels: Object.keys(inventoryStats.byAge || {}),
    datasets: [
      {
        label: 'Units by Age',
        data: Object.values(inventoryStats.byAge || {}),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  } : null;

  // Options for age distribution chart
  const ageChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Blood Units by Age',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Units',
        },
      },
    },
  };

  // Calculate inventory status percentages
  const calculateStatusPercentages = () => {
    if (!inventoryStats) return [];
    
    const totalUnits = inventoryStats.totalUnits || 1; // Avoid division by zero
    
    return [
      {
        status: 'Available',
        count: inventoryStats.availableUnits || 0,
        percentage: ((inventoryStats.availableUnits || 0) / totalUnits) * 100,
        color: 'green',
      },
      {
        status: 'Reserved',
        count: inventoryStats.reservedUnits || 0,
        percentage: ((inventoryStats.reservedUnits || 0) / totalUnits) * 100,
        color: 'blue',
      },
      {
        status: 'Quarantined',
        count: inventoryStats.quarantinedUnits || 0,
        percentage: ((inventoryStats.quarantinedUnits || 0) / totalUnits) * 100,
        color: 'yellow',
      },
      {
        status: 'Expired',
        count: inventoryStats.expiredUnits || 0,
        percentage: ((inventoryStats.expiredUnits || 0) / totalUnits) * 100,
        color: 'red',
      },
    ];
  };

  // Render a stat card
  const renderStat = (title, value, icon, color, helpText) => (
    <Card bg={cardBg} boxShadow="sm" height="full">
      <CardBody>
        <Flex justify="space-between">
          <Box>
            <Text fontWeight="medium" color="gray.500">{title}</Text>
            <Skeleton isLoaded={!loading} mt={2}>
              <Text fontSize="2xl" fontWeight="bold">{value}</Text>
            </Skeleton>
            {helpText && (
              <Skeleton isLoaded={!loading}>
                <Text fontSize="sm" color="gray.500" mt={1}>{helpText}</Text>
              </Skeleton>
            )}
          </Box>
          <Flex
            justifyContent="center"
            alignItems="center"
            borderRadius="full"
            bg={`${color}.100`}
            color={`${color}.500`}
            h={12}
            w={12}
          >
            <Icon as={icon} boxSize={6} />
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        {renderStat(
          'Total Blood Units',
          loading ? '...' : inventoryStats?.totalUnits || 0,
          FiDroplet,
          'red',
          'All blood units in system'
        )}
        
        {renderStat(
          'Available Units',
          loading ? '...' : inventoryStats?.availableUnits || 0,
          FiCheckCircle,
          'green',
          'Ready for use'
        )}
        
        {renderStat(
          'Expiring Soon',
          loading ? '...' : inventoryStats?.expiringIn7Days || 0,
          FiAlertTriangle,
          'orange',
          'Within next 7 days'
        )}
        
        {renderStat(
          'Quarantined',
          loading ? '...' : inventoryStats?.quarantinedUnits || 0,
          FiClock,
          'yellow',
          'Pending testing/clearance'
        )}
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <GridItem>
          <Card bg={cardBg} boxShadow="sm">
            <CardHeader pb={1}>
              <Heading size="md">Blood Type Distribution</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Skeleton isLoaded={!loading} height="250px" borderRadius="md">
                    {bloodTypeChartData && (
                      <Box height="250px" position="relative">
                        <Pie data={bloodTypeChartData} options={{ maintainAspectRatio: false }} />
                      </Box>
                    )}
                  </Skeleton>
                </Box>
                
                <Box>
                  <Text mb={4} fontWeight="medium">Blood Type Inventory</Text>
                  <Skeleton isLoaded={!loading}>
                    <Stack spacing={3}>
                      {inventoryStats && Object.entries(inventoryStats.byBloodType || {}).map(([type, count]) => (
                        <Flex key={type} justify="space-between" align="center">
                          <Badge colorScheme="red" px={2} py={1}>
                            {type}
                          </Badge>
                          <Text fontWeight="bold">{count} units</Text>
                        </Flex>
                      ))}
                    </Stack>
                  </Skeleton>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card bg={cardBg} boxShadow="sm">
            <CardHeader pb={1}>
              <Heading size="md">Inventory Status</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <Skeleton isLoaded={!loading}>
                <Stack spacing={4}>
                  {calculateStatusPercentages().map((statusItem) => (
                    <Box key={statusItem.status}>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm">{statusItem.status}</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {statusItem.count} ({statusItem.percentage.toFixed(1)}%)
                        </Text>
                      </Flex>
                      <Progress 
                        value={statusItem.percentage} 
                        colorScheme={statusItem.color} 
                        borderRadius="full"
                        size="sm"
                      />
                    </Box>
                  ))}
                </Stack>
              </Skeleton>
              
              <Box mt={6}>
                <Flex justify="flex-end">
                  <Button 
                    as={NextLink} 
                    href="/inventory/blood-units" 
                    size="sm" 
                    colorScheme="blue" 
                    variant="outline"
                  >
                    View All Units
                  </Button>
                </Flex>
              </Box>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card bg={cardBg} boxShadow="sm">
            <CardHeader pb={1}>
              <Heading size="md">Age Distribution</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <Skeleton isLoaded={!loading} height="250px" borderRadius="md">
                {ageDistributionData && (
                  <Box height="250px" position="relative">
                    <Bar data={ageDistributionData} options={ageChartOptions} />
                  </Box>
                )}
              </Skeleton>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card bg={cardBg} boxShadow="sm">
            <CardHeader pb={1}>
              <Flex justify="space-between" align="center">
                <Heading size="md">Critical Expiry Alerts</Heading>
                <Badge colorScheme="red" py={1} px={2} borderRadius="full">
                  {loading ? '...' : expiryData?.summary?.critical || 0} critical
                </Badge>
              </Flex>
            </CardHeader>
            <Divider />
            <CardBody>
              <Skeleton isLoaded={!loading}>
                {expiryData?.expiringUnits?.length > 0 ? (
                  <Stack spacing={3}>
                    {expiryData.expiringUnits.slice(0, 5).map((unit) => (
                      <Box key={unit._id} p={3} borderWidth="1px" borderRadius="md">
                        <Flex justify="space-between" mb={1}>
                          <Badge colorScheme="red">{unit.bloodType}</Badge>
                          <Badge 
                            colorScheme={new Date(unit.expirationDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? 'red' : 'orange'}
                          >
                            Expires: {new Date(unit.expirationDate).toLocaleDateString()}
                          </Badge>
                        </Flex>
                        <Flex justify="space-between" mt={2}>
                          <Text fontSize="sm">Unit ID: {unit.unitId}</Text>
                          <Text fontSize="sm">{unit.location?.facility}</Text>
                        </Flex>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    No critical expiry alerts at this time
                  </Alert>
                )}
              </Skeleton>
              
              <Box mt={4}>
                <Flex justify="flex-end">
                  <Button 
                    as={NextLink} 
                    href="/inventory/expiry-tracking" 
                    size="sm" 
                    colorScheme="orange" 
                    variant="outline"
                  >
                    View All Expiring Units
                  </Button>
                </Flex>
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default InventoryDashboard;
