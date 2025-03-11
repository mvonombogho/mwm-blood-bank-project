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
  Skeleton,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Flex,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaUserFriends, FaCalendarCheck, FaDroplet, FaUserClock } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

const DonorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationsByMonth, setDonationsByMonth] = useState({});
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/donors/stats');
        setStats(response.data);

        // Format the donations by month data for chart
        if (response.data.donationsByMonth) {
          setDonationsByMonth({
            labels: Object.keys(response.data.donationsByMonth),
            datasets: [
              {
                label: 'Monthly Donations',
                data: Object.values(response.data.donationsByMonth),
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                tension: 0.4,
              },
            ],
          });
        }
      } catch (error) {
        console.error('Error fetching donor stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Donations Trend',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Donations',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  // Function to render stat cards with skeletons when loading
  const renderStatCard = (title, value, icon, helpText = null, change = null) => (
    <Card bg={cardBg} boxShadow="sm" borderRadius="lg" height="full">
      <CardHeader pb={1}>
        <Flex justify="space-between" align="center">
          <Text fontWeight="medium" fontSize="sm" color="gray.500">
            {title}
          </Text>
          <Icon as={icon} boxSize={5} color="blue.500" />
        </Flex>
      </CardHeader>
      <CardBody pt={0}>
        <Skeleton isLoaded={!loading}>
          <Stat>
            <StatNumber fontSize="2xl">{value}</StatNumber>
            {helpText && (
              <StatHelpText mb={0}>
                {change && <StatArrow type={change > 0 ? 'increase' : 'decrease'} />}
                {helpText}
              </StatHelpText>
            )}
          </Stat>
        </Skeleton>
      </CardBody>
    </Card>
  );

  return (
    <Box>
      <Heading size="lg" mb={6}>Donor Dashboard</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={6}>
        {renderStatCard(
          'Total Donors',
          loading ? '...' : stats?.totalDonors || 0,
          FaUserFriends,
          'Registered donors'
        )}
        {renderStatCard(
          'Active Donors',
          loading ? '...' : stats?.activeDonors || 0,
          FaUserClock,
          'Last 3 months',
          stats?.activeDonorsChange
        )}
        {renderStatCard(
          'Total Donations',
          loading ? '...' : stats?.totalDonations || 0,
          FaDroplet,
          'All time'
        )}
        {renderStatCard(
          'Donations This Month',
          loading ? '...' : stats?.donationsThisMonth || 0,
          FaCalendarCheck,
          'vs. last month',
          stats?.donationsMonthlyChange
        )}
      </SimpleGrid>

      <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Card bg={cardBg} boxShadow="sm" borderRadius="lg">
            <CardHeader>
              <Heading size="md">Donation Trends</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <Skeleton isLoaded={!loading} height={loading ? '300px' : 'auto'}>
                {stats && Object.keys(donationsByMonth).length > 0 && (
                  <Box h="300px">
                    <Line data={donationsByMonth} options={chartOptions} />
                  </Box>
                )}
              </Skeleton>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem colSpan={1}>
          <Card bg={cardBg} boxShadow="sm" borderRadius="lg" height="full">
            <CardHeader>
              <Heading size="md">Blood Type Distribution</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <Skeleton isLoaded={!loading} height={loading ? '300px' : 'auto'}>
                {stats?.bloodTypeDistribution && (
                  <Box>
                    {Object.entries(stats.bloodTypeDistribution).map(([bloodType, count]) => (
                      <Flex key={bloodType} justify="space-between" align="center" mb={3}>
                        <Badge colorScheme="red" px={3} py={1} borderRadius="full">
                          {bloodType}
                        </Badge>
                        <Text fontWeight="bold">{count} donors</Text>
                      </Flex>
                    ))}
                  </Box>
                )}
              </Skeleton>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default DonorDashboard;
