import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Select,
  HStack,
  SimpleGrid,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiDownload, FiFilter } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BloodSupplyTrends = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('6months');
  const [bloodType, setBloodType] = useState('all');
  const [trendData, setTrendData] = useState(null);
  const [distributionData, setDistributionData] = useState(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    fetchTrendData();
  }, [timeRange, bloodType]);
  
  const fetchTrendData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, call your API with the filters
      // const response = await fetch(`/api/inventory/trends?timeRange=${timeRange}&bloodType=${bloodType}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch blood supply trend data');
      // }
      // const data = await response.json();
      
      // For now, we'll use mock data
      const mockData = generateMockData(timeRange, bloodType);
      
      // Set chart data
      setTrendData(mockData.trend);
      setDistributionData(mockData.distribution);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching blood supply trend data:', err);
      setError('Failed to load blood supply trend data. Please try again.');
      setLoading(false);
    }
  };
  
  // Generate mock data for development/testing
  const generateMockData = (period, type) => {
    // Define labels based on selected time period
    let labels = [];
    let datasets = [];
    
    // Generate time labels
    const now = new Date();
    
    switch (period) {
      case '30days':
        // Daily data for 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;
      case '3months':
        // Weekly data for 3 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - (i * 7));
          labels.push(`Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
        }
        break;
      case '6months':
      default:
        // Monthly data for 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
        }
        break;
      case '1year':
        // Monthly data for 1 year
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(now.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        }
        break;
    }
    
    // Generate datasets
    if (type === 'all') {
      // Generate data for all blood types
      const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      const colors = [
        'rgba(255, 99, 132, 0.7)',   // A+
        'rgba(255, 159, 64, 0.7)',   // A-
        'rgba(255, 205, 86, 0.7)',   // B+
        'rgba(75, 192, 192, 0.7)',   // B-
        'rgba(54, 162, 235, 0.7)',   // AB+
        'rgba(153, 102, 255, 0.7)',  // AB-
        'rgba(201, 203, 207, 0.7)',  // O+
        'rgba(99, 255, 132, 0.7)',   // O-
      ];
      
      bloodTypes.forEach((bloodType, index) => {
        const data = labels.map(() => Math.floor(Math.random() * 100) + 20);
        datasets.push({
          label: bloodType,
          data: data,
          borderColor: colors[index].replace('0.7', '1'),
          backgroundColor: colors[index],
          tension: 0.3
        });
      });
    } else {
      // Generate data for a specific blood type
      const colors = {
        'A+': 'rgba(255, 99, 132, 0.7)',
        'A-': 'rgba(255, 159, 64, 0.7)',
        'B+': 'rgba(255, 205, 86, 0.7)',
        'B-': 'rgba(75, 192, 192, 0.7)',
        'AB+': 'rgba(54, 162, 235, 0.7)',
        'AB-': 'rgba(153, 102, 255, 0.7)',
        'O+': 'rgba(201, 203, 207, 0.7)',
        'O-': 'rgba(99, 255, 132, 0.7)',
      };
      
      const donations = labels.map(() => Math.floor(Math.random() * 100) + 20);
      const usage = labels.map(() => Math.floor(Math.random() * 90) + 10);
      
      datasets = [
        {
          label: 'Donations',
          data: donations,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          tension: 0.3
        },
        {
          label: 'Usage',
          data: usage,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          tension: 0.3
        }
      ];
    }
    
    // Generate blood type distribution data (bar chart)
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const distributionData = {
      labels: bloodTypes,
      datasets: [
        {
          label: 'Available Units',
          data: bloodTypes.map(() => Math.floor(Math.random() * 500) + 50),
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        }
      ]
    };
    
    return {
      trend: {
        labels,
        datasets
      },
      distribution: distributionData
    };
  };
  
  // Chart options
  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: bloodType === 'all' ? 'Blood Supply Levels by Type' : `${bloodType} Supply Trend (Donations vs. Usage)`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units'
        }
      }
    }
  };
  
  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Current Blood Type Distribution',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units Available'
        }
      }
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap">
        <Heading as="h2" size="lg">Blood Supply Trends</Heading>
        
        <HStack spacing={4} mt={{ base: 4, md: 0 }}>
          <Select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            maxW="150px"
          >
            <option value="30days">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last 1 Year</option>
          </Select>
          
          <Select 
            value={bloodType}
            onChange={(e) => setBloodType(e.target.value)}
            maxW="120px"
          >
            <option value="all">All Types</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Select>
          
          <Button leftIcon={<FiDownload />} colorScheme="blue">
            Export
          </Button>
        </HStack>
      </Flex>
      
      {loading ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Blood Supply Trend Chart */}
          <Card bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardHeader pb={2}>
              <Heading size="md">Supply Trends</Heading>
            </CardHeader>
            <CardBody>
              <Box height="400px">
                <Line data={trendData} options={trendOptions} />
              </Box>
              <Text fontSize="sm" mt={4} color="gray.500" textAlign="center">
                {bloodType === 'all'
                  ? 'Track blood supply levels for all blood types over time'
                  : `Compare donations and usage trends for ${bloodType} blood type`}
              </Text>
            </CardBody>
          </Card>
          
          {/* Blood Type Distribution Chart */}
          <Card bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardHeader pb={2}>
              <Heading size="md">Current Inventory Distribution</Heading>
            </CardHeader>
            <CardBody>
              <Box height="400px">
                <Bar data={distributionData} options={distributionOptions} />
              </Box>
              <Text fontSize="sm" mt={4} color="gray.500" textAlign="center">
                Current blood inventory levels by blood type
              </Text>
            </CardBody>
          </Card>
          
          {/* Key Insights Card */}
          <Card bg={cardBg} boxShadow="md" borderRadius="lg" gridColumn={{ lg: "span 2" }}>
            <CardHeader pb={2}>
              <Heading size="md">Insights & Recommendations</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <Heading size="sm" mb={2} color="red.500">Critical Levels</Heading>
                  <Text>
                    {bloodType === 'all' 
                      ? 'O- and AB- blood types are at critical levels (below 20% capacity).'
                      : `${bloodType} usage has exceeded donations for 3 consecutive months.`}
                  </Text>
                </Box>
                
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <Heading size="sm" mb={2} color="blue.500">Donation Trends</Heading>
                  <Text>
                    {bloodType === 'all'
                      ? 'Overall donations have increased by 12% compared to the previous period.'
                      : `${bloodType} donations show a seasonal pattern with peaks in March and September.`}
                  </Text>
                </Box>
                
                <Box p={4} borderWidth="1px" borderRadius="md">
                  <Heading size="sm" mb={2} color="green.500">Recommendations</Heading>
                  <Text>
                    {bloodType === 'all'
                      ? 'Focus donation drives on O- and AB- blood types to increase critical inventory levels.'
                      : `Consider organizing targeted donation drive for ${bloodType} blood type in the coming month.`}
                  </Text>
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}
    </Box>
  );
};

export default BloodSupplyTrends;