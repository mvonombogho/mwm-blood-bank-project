import { useState, useEffect } from 'react';
import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Text, Stack, Button, Card, CardBody, CardHeader, useColorModeValue, Flex, Icon, Badge, Progress } from '@chakra-ui/react';
import { FaVial, FaUserInjured, FaUser, FaThermometerHalf, FaTint, FaCalendarDay, FaExclamationTriangle } from 'react-icons/fa';
import Layout from '../components/Layout';
import AuthGuard from '../components/auth/AuthGuard';
import NextLink from 'next/link';
import axios from 'axios';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // This would be replaced with actual API calls in a real app
        // Example: const response = await axios.get('/api/dashboard');
        
        // For now, let's use mock data
        const mockData = {
          inventory: {
            totalUnits: 253,
            availableUnits: 189,
            expiringUnits: 12,
            criticalTypes: ['O-', 'AB-']
          },
          bloodTypes: {
            'A+': { total: 45, available: 38 },
            'A-': { total: 22, available: 15 },
            'B+': { total: 38, available: 30 },
            'B-': { total: 15, available: 12 },
            'AB+': { total: 12, available: 9 },
            'AB-': { total: 8, available: 4 },
            'O+': { total: 65, available: 53 },
            'O-': { total: 48, available: 28 }
          },
          storage: {
            units: 4,
            alerts: 1,
            maintenance: 0
          },
          recipients: {
            total: 142,
            activeRequests: 8
          },
          donors: {
            total: 527,
            thisMonth: 48
          }
        };
        
        setDashboardData(mockData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Define what permissions see which sections
  const canSeeInventory = !session || session.user.permissions.canManageInventory;
  const canSeeDonors = !session || session.user.permissions.canManageDonors;
  const canSeeRecipients = !session || session.user.permissions.canManageRecipients;
  
  const StatCard = ({ title, value, icon, color, subtext, link }) => {
    const Icon = icon;
    
    return (
      <Card bg={cardBg} shadow="md">
        <CardBody>
          <Flex justify="space-between">
            <Box>
              <StatLabel color="gray.500">{title}</StatLabel>
              <StatNumber fontSize="3xl" fontWeight="medium" color={`${color}.500`}>
                {value}
              </StatNumber>
              {subtext && (
                <StatHelpText>
                  {subtext}
                </StatHelpText>
              )}
            </Box>
            <Flex
              w={12}
              h={12}
              align="center"
              justify="center"
              rounded="full"
              bg={`${color}.100`}
            >
              <Icon color={`${color}.500`} size="24px" />
            </Flex>
          </Flex>
          
          {link && (
            <NextLink href={link} passHref>
              <Button as="a" size="sm" variant="ghost" colorScheme={color} mt={4}>
                View Details
              </Button>
            </NextLink>
          )}
        </CardBody>
      </Card>
    );
  };
  
  const BloodTypeCard = ({ data }) => (
    <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
      <CardHeader pb={0}>
        <Heading as="h3" size="md" mb={2}>
          Blood Inventory Levels
        </Heading>
      </CardHeader>
      <CardBody>
        <Stack spacing={4}>
          {Object.entries(data?.bloodTypes || {}).map(([type, stats]) => (
            <Box key={type}>
              <Flex justify="space-between" mb={1}>
                <HStack>
                  <Badge colorScheme="red">{type}</Badge>
                  <Text fontWeight="medium">{stats.available} / {stats.total} units</Text>
                </HStack>
                <Text fontSize="sm">
                  {Math.round((stats.available / stats.total) * 100)}%
                </Text>
              </Flex>
              <Progress 
                value={(stats.available / stats.total) * 100} 
                size="sm" 
                colorScheme={(stats.available / stats.total) < 0.3 ? "red" : 
                             (stats.available / stats.total) < 0.6 ? "yellow" : "green"} 
                borderRadius="full"
              />
            </Box>
          ))}
        </Stack>
      </CardBody>
    </Card>
  );
  
  const CriticalAlert = ({ data }) => {
    if (!data || !data.criticalTypes || data.criticalTypes.length === 0) return null;
    
    return (
      <Card bg="red.50" borderLeft="4px" borderColor="red.500" shadow="md">
        <CardBody>
          <Flex align="center">
            <Icon as={FaExclamationTriangle} color="red.500" boxSize={6} mr={4} />
            <Box>
              <Heading as="h4" size="sm" mb={1}>
                Critical Blood Levels
              </Heading>
              <Text>
                Blood types {data.criticalTypes.join(', ')} are at critical levels. 
                <NextLink href="/inventory" passHref>
                  <Button as="a" size="sm" colorScheme="red" variant="link" ml={1}>
                    View inventory
                  </Button>
                </NextLink>
              </Text>
            </Box>
          </Flex>
        </CardBody>
      </Card>
    );
  };
  
  return (
    <AuthGuard>
      <Layout title="Dashboard">
        <Box maxW="7xl" mx="auto">
          <Heading as="h1" size="xl" mb={6}>
            Blood Bank Dashboard
          </Heading>
          
          {!isLoading && dashboardData?.inventory?.criticalTypes?.length > 0 && (
            <Box mb={6}>
              <CriticalAlert data={dashboardData.inventory} />
            </Box>
          )}
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            {canSeeInventory && (
              <StatCard
                title="Blood Units"
                value={dashboardData?.inventory?.totalUnits || 0}
                icon={FaVial}
                color="red"
                subtext={`${dashboardData?.inventory?.availableUnits || 0} available`}
                link="/inventory/blood-units"
              />
            )}
            
            {canSeeInventory && (
              <StatCard
                title="Storage Units"
                value={dashboardData?.storage?.units || 0}
                icon={FaThermometerHalf}
                color="blue"
                subtext={dashboardData?.storage?.alerts > 0 ? `${dashboardData.storage.alerts} alerts` : 'No alerts'}
                link="/inventory/storage"
              />
            )}
            
            {canSeeDonors && (
              <StatCard
                title="Total Donors"
                value={dashboardData?.donors?.total || 0}
                icon={FaUser}
                color="green"
                subtext={`${dashboardData?.donors?.thisMonth || 0} this month`}
                link="/donors"
              />
            )}
            
            {canSeeRecipients && (
              <StatCard
                title="Recipients"
                value={dashboardData?.recipients?.total || 0}
                icon={FaUserInjured}
                color="purple"
                subtext={`${dashboardData?.recipients?.activeRequests || 0} active requests`}
                link="/recipients"
              />
            )}
          </SimpleGrid>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {canSeeInventory && (
              <BloodTypeCard data={dashboardData} />
            )}
            
            {canSeeInventory && (
              <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
                <CardHeader pb={0}>
                  <Heading as="h3" size="md" mb={2}>
                    Expiring Units
                  </Heading>
                </CardHeader>
                <CardBody>
                  <Text mb={4}>
                    {dashboardData?.inventory?.expiringUnits || 0} units expiring in the next 7 days
                  </Text>
                  <NextLink href="/inventory/expiry-tracking" passHref>
                    <Button as="a" colorScheme="orange" size="sm">
                      View Expiry Tracking
                    </Button>
                  </NextLink>
                </CardBody>
              </Card>
            )}
          </SimpleGrid>
        </Box>
      </Layout>
    </AuthGuard>
  );
}
