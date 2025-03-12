import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Text,
  Stack,
  Badge,
  Divider,
  Flex,
  Button,
  Icon,
  Grid,
  GridItem,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { FiUsers, FiDroplet, FiActivity, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';

const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [expiryAlerts, setExpiryAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const bgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard data in parallel
        const [donorResponse, inventoryResponse, expiryResponse] = await Promise.all([
          axios.get('/api/donors/stats'),
          axios.get('/api/inventory/blood-units/stats'),
          axios.get('/api/inventory/expiry-tracking?critical=true&limit=3')
        ]);
        
        setStats(donorResponse.data);
        setInventory(inventoryResponse.data);
        setExpiryAlerts(expiryResponse.data.expiringUnits || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Helper function to safely format the monthly change text
  const getMonthlyChangeText = (change) => {
    // Return a default message if change is undefined or null
    if (change === undefined || change === null) {
      return 'No change data available';
    }
    
    // Safely calculate the absolute value and format
    const absChange = Math.abs(parseFloat(change) || 0).toFixed(1);
    return change > 0 ? `${absChange}% increase` : `${absChange}% decrease`;
  };
  
  const renderStat = (title, value, icon, color, helpText, change) => (
    <Card bg={bgColor} boxShadow="sm">
      <CardBody>
        <Flex justify="space-between">
          <Box>
            <Stat>
              <StatLabel fontWeight="medium" isTruncated>{title}</StatLabel>
              <Skeleton isLoaded={!loading} mt={2}>
                <StatNumber fontSize="3xl">{value}</StatNumber>
              </Skeleton>
              {helpText && (
                <Skeleton isLoaded={!loading}>
                  <StatHelpText>
                    {change !== undefined && change !== null && (
                      <StatArrow type={change > 0 ? 'increase' : 'decrease'} />
                    )}
                    {helpText}
                  </StatHelpText>
                </Skeleton>
              )}
            </Stat>
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

  return (
    <Container maxW="container.xl" py={5}>
      <Box mb={8}>
        <Heading mb={1}>Dashboard</Heading>
        <Text color="gray.600">Welcome to the Blood Bank Management System</Text>
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {renderStat(
          'Total Donors',
          loading ? '...' : stats?.totalDonors || 0,
          FiUsers,
          'blue',
          'Registered donors'
        )}
        
        {renderStat(
          'Available Blood Units',
          loading ? '...' : inventory?.availableUnits || 0,
          FiDroplet,
          'red',
          'In inventory'
        )}
        
        {renderStat(
          'This Month Donations',
          loading ? '...' : stats?.donationsThisMonth || 0,
          FiActivity,
          'green',
          getMonthlyChangeText(stats?.donationsMonthlyChange),
          stats?.donationsMonthlyChange
        )}
        
        {renderStat(
          'Critical Alerts',
          loading ? '...' : expiryAlerts?.length || 0,
          FiAlertCircle,
          'orange',
          'Expiring soon'
        )}
      </SimpleGrid>
      
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <GridItem>
          <Card bg={bgColor} boxShadow="sm">
            <CardHeader>
              <Heading size="md">Blood Inventory Status</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <Skeleton isLoaded={!loading}>
                {inventory ? (
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={5}>
                    {Object.entries(inventory.byBloodType || {}).map(([type, count]) => (
                      <Box key={type} textAlign="center" p={3} borderWidth="1px" borderRadius="lg">
                        <Badge colorScheme="red" fontSize="xl" p={2} mb={2}>
                          {type}
                        </Badge>
                        <Text fontWeight="bold" fontSize="2xl">{count}</Text>
                        <Text fontSize="sm" color="gray.500">units</Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Text>No inventory data available</Text>
                )}
              </Skeleton>
              
              <Flex justify="flex-end" mt={4}>
                <Link href="/inventory" passHref legacyBehavior>
                  <Button
                    as="a"
                    variant="outline"
                    size="sm"
                    colorScheme="blue"
                  >
                    View All Inventory
                  </Button>
                </Link>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card bg={bgColor} boxShadow="sm">
            <CardHeader>
              <Heading size="md">Expiring Units Alert</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <Skeleton isLoaded={!loading}>
                {expiryAlerts && expiryAlerts.length > 0 ? (
                  <Stack spacing={3}>
                    {expiryAlerts.map((unit) => (
                      <Alert key={unit._id} status="warning" variant="left-accent" borderRadius="md">
                        <AlertIcon />
                        <Box flex="1">
                          <Text fontWeight="bold">
                            {unit.bloodType} ({unit.volume} mL)
                          </Text>
                          <Text fontSize="sm">
                            Expires: {new Date(unit.expirationDate).toLocaleDateString()}
                          </Text>
                        </Box>
                      </Alert>
                    ))}
                  </Stack>
                ) : (
                  <Alert status="info">
                    <AlertIcon />
                    No critical expiry alerts at this time
                  </Alert>
                )}
              </Skeleton>
              
              <Flex justify="flex-end" mt={4}>
                <Link href="/inventory/expiry-tracking" passHref legacyBehavior>
                  <Button
                    as="a"
                    variant="outline"
                    size="sm"
                    colorScheme="orange"
                    leftIcon={<FiCalendar />}
                  >
                    View Expiry Calendar
                  </Button>
                </Link>
              </Flex>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default HomePage;