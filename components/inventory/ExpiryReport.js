import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Select,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  IconButton,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  Tooltip,
  Divider,
  Progress
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiFilter, 
  FiAlertTriangle, 
  FiCalendar, 
  FiClock,
  FiTrash2,
  FiInfo
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const ExpiryReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expiryData, setExpiryData] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('30d');
  const [filterBloodType, setFilterBloodType] = useState('all');
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    fetchExpiryData();
  }, [filterPeriod, filterBloodType]);
  
  const fetchExpiryData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would fetch data from an API
      // const response = await fetch(`/api/inventory/expiry?period=${filterPeriod}&bloodType=${filterBloodType}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch expiry data');
      // }
      // const data = await response.json();
      
      // Using mock data for now
      setTimeout(() => {
        const mockData = generateMockData();
        setExpiryData(mockData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching expiry data:', error);
      setError('Failed to load expiry data. Please try again.');
      setLoading(false);
    }
  };
  
  const generateMockData = () => {
    // Generate timeframes based on selected period
    const timeframes = [];
    const units = [];
    const expiryRanges = [];
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    // Generate dates based on selected period
    const now = new Date();
    const days = filterPeriod === '7d' ? 7 : filterPeriod === '30d' ? 30 : 90;
    
    // For 7-day period, show daily data
    // For 30-day period, show weekly data
    // For 90-day period, show monthly data
    const interval = filterPeriod === '7d' ? 1 : filterPeriod === '30d' ? 7 : 30;
    const totalIntervals = Math.ceil(days / interval);
    
    // Calculate expiry timeframes
    for (let i = 0; i < totalIntervals; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + (i * interval));
      
      // Format date label based on interval
      let label;
      if (interval === 1) {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (interval === 7) {
        label = `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      } else {
        label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
      
      timeframes.push(label);
      expiryRanges.push({
        label,
        startDate: new Date(date),
        endDate: new Date(date.setDate(date.getDate() + interval - 1))
      });
    }
    
    // Generate units data
    // If blood type filter is set, only show that type
    const relevantBloodTypes = filterBloodType === 'all' ? bloodTypes : [filterBloodType];
    
    relevantBloodTypes.forEach(bloodType => {
      for (let i = 0; i < totalIntervals; i++) {
        // More units expire in the near future
        const baseCount = Math.floor(Math.random() * 15) + (totalIntervals - i);
        
        // Generate unit details
        for (let j = 0; j < baseCount; j++) {
          const expiryRange = expiryRanges[i];
          const expiryDate = new Date(expiryRange.startDate);
          expiryDate.setDate(expiryRange.startDate.getDate() + Math.floor(Math.random() * interval));
          
          const collectionDate = new Date(expiryDate);
          // Blood typically has a 42-day shelf life
          collectionDate.setDate(expiryDate.getDate() - 42);
          
          units.push({
            id: `BU-${bloodType.replace('+', 'P').replace('-', 'N')}-${1000 + i * 100 + j}`,
            bloodType,
            collectionDate: collectionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            expiryDate: expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            daysUntilExpiry: Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24)),
            location: `Main Storage, Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}`,
            quantity: 450, // ml
            donorId: `D-${10000 + Math.floor(Math.random() * 1000)}`,
            status: 'Available'
          });
        }
      }
    });
    
    // Sort by days until expiry (ascending)
    units.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    
    // Generate chart data
    const chartData = {
      labels: timeframes,
      datasets: []
    };
    
    if (filterBloodType === 'all') {
      // Generate dataset for each blood type
      relevantBloodTypes.forEach((bloodType, index) => {
        const data = Array(timeframes.length).fill(0);
        
        // Count units per timeframe
        units.filter(unit => unit.bloodType === bloodType).forEach(unit => {
          const timeIndex = expiryRanges.findIndex(range => 
            new Date(unit.expiryDate) >= range.startDate && 
            new Date(unit.expiryDate) <= range.endDate
          );
          
          if (timeIndex >= 0) {
            data[timeIndex]++;
          }
        });
        
        // Colors for each blood type
        const colors = {
          'A+': 'rgba(255, 99, 132, 0.7)',
          'A-': 'rgba(255, 159, 64, 0.7)',
          'B+': 'rgba(255, 205, 86, 0.7)',
          'B-': 'rgba(75, 192, 192, 0.7)',
          'AB+': 'rgba(54, 162, 235, 0.7)',
          'AB-': 'rgba(153, 102, 255, 0.7)',
          'O+': 'rgba(201, 203, 207, 0.7)',
          'O-': 'rgba(220, 53, 69, 0.7)'
        };
        
        chartData.datasets.push({
          label: bloodType,
          data,
          backgroundColor: colors[bloodType],
          borderColor: colors[bloodType].replace('0.7', '1'),
          borderWidth: 1
        });
      });
    } else {
      // Single dataset for the selected blood type
      const data = Array(timeframes.length).fill(0);
      
      // Count units per timeframe
      units.forEach(unit => {
        const timeIndex = expiryRanges.findIndex(range => 
          new Date(unit.expiryDate) >= range.startDate && 
          new Date(unit.expiryDate) <= range.endDate
        );
        
        if (timeIndex >= 0) {
          data[timeIndex]++;
        }
      });
      
      chartData.datasets.push({
        label: 'Expiring Units',
        data,
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      });
    }
    
    // Calculate summary statistics
    const totalUnits = units.length;
    const expiringWithin7Days = units.filter(unit => unit.daysUntilExpiry <= 7).length;
    const expiringWithin30Days = units.filter(unit => unit.daysUntilExpiry <= 30).length;
    const criticalTypeData = {};
    
    // Calculate expiry by blood type
    bloodTypes.forEach(type => {
      const typeUnits = units.filter(unit => unit.bloodType === type);
      criticalTypeData[type] = {
        total: typeUnits.length,
        critical: typeUnits.filter(unit => unit.daysUntilExpiry <= 7).length
      };
    });
    
    return {
      units,
      chartData,
      stats: {
        totalUnits,
        expiringWithin7Days,
        expiringWithin30Days,
        criticalTypeData
      }
    };
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Number of Units'
        }
      },
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Blood Units Expiry Forecast',
      },
    },
  };
  
  const getStatusBadge = (daysUntilExpiry) => {
    if (daysUntilExpiry <= 0) {
      return <Badge colorScheme="red">Expired</Badge>;
    } else if (daysUntilExpiry <= 7) {
      return <Badge colorScheme="red">Critical</Badge>;
    } else if (daysUntilExpiry <= 14) {
      return <Badge colorScheme="orange">Warning</Badge>;
    } else {
      return <Badge colorScheme="green">Good</Badge>;
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap">
        <Heading as="h2" size="lg">Blood Expiry Analysis</Heading>
        
        <HStack spacing={4} mt={{ base: 4, md: 0 }}>
          <Select 
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            maxW="150px"
          >
            <option value="7d">Next 7 Days</option>
            <option value="30d">Next 30 Days</option>
            <option value="90d">Next 90 Days</option>
          </Select>
          
          <Select 
            value={filterBloodType}
            onChange={(e) => setFilterBloodType(e.target.value)}
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
      ) : expiryData && (
        <>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardBody>
                <Stat>
                  <StatLabel display="flex" alignItems="center">
                    <FiClock style={{ marginRight: '8px' }} /> Total Expiring Units
                  </StatLabel>
                  <StatNumber>{expiryData.stats.totalUnits}</StatNumber>
                  <StatHelpText>
                    Over the next {filterPeriod === '7d' ? '7 days' : filterPeriod === '30d' ? '30 days' : '90 days'}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardBody>
                <Stat>
                  <StatLabel display="flex" alignItems="center">
                    <FiAlertTriangle style={{ marginRight: '8px', color: '#E53E3E' }} /> Critical Expiry
                  </StatLabel>
                  <StatNumber>{expiryData.stats.expiringWithin7Days}</StatNumber>
                  <StatHelpText>
                    Expiring within 7 days ({Math.round(expiryData.stats.expiringWithin7Days / expiryData.stats.totalUnits * 100)}%)
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardBody>
                <Stat>
                  <StatLabel display="flex" alignItems="center">
                    <FiCalendar style={{ marginRight: '8px' }} /> Nearest Expiry
                  </StatLabel>
                  <StatNumber>
                    {expiryData.units[0]?.bloodType || '-'}
                  </StatNumber>
                  <StatHelpText>
                    {expiryData.units[0]?.daysUntilExpiry} days left ({expiryData.units[0]?.expiryDate})
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardHeader pb={2}>
                <Heading size="md">Expiry Distribution</Heading>
              </CardHeader>
              <CardBody>
                <Box height="400px">
                  <Bar data={expiryData.chartData} options={chartOptions} />
                </Box>
              </CardBody>
            </Card>
            
            <Card bg={cardBg} boxShadow="md" borderRadius="lg">
              <CardHeader pb={2}>
                <Heading size="md">Critical Units by Blood Type</Heading>
              </CardHeader>
              <CardBody>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Blood Type</Th>
                      <Th isNumeric>Total Units</Th>
                      <Th isNumeric>Critical Units</Th>
                      <Th>Percentage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(expiryData.stats.criticalTypeData)
                      .filter(([type, data]) => data.total > 0)
                      .sort((a, b) => b[1].critical / b[1].total - a[1].critical / a[1].total)
                      .map(([type, data]) => (
                        <Tr key={type}>
                          <Td>
                            <Badge colorScheme={
                              type.includes('O') ? 'green' : 
                              type.includes('A') ? 'blue' : 
                              type.includes('B') ? 'orange' : 
                              'purple'
                            }>
                              {type}
                            </Badge>
                          </Td>
                          <Td isNumeric>{data.total}</Td>
                          <Td isNumeric>
                            <Text fontWeight={data.critical > 0 ? 'bold' : 'normal'} color={data.critical > 0 ? 'red.500' : undefined}>
                              {data.critical}
                            </Text>
                          </Td>
                          <Td>
                            <Box>
                              <Text fontSize="sm" mb={1}>{Math.round(data.critical / data.total * 100)}%</Text>
                              <Progress 
                                value={data.critical / data.total * 100} 
                                size="xs" 
                                colorScheme={
                                  data.critical / data.total > 0.5 ? "red" : 
                                  data.critical / data.total > 0.25 ? "orange" : 
                                  "green"
                                }
                              />
                            </Box>
                          </Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          <Card bg={cardBg} boxShadow="md" borderRadius="lg">
            <CardHeader>
              <Heading size="md">Expiring Units List</Heading>
            </CardHeader>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Unit ID</Th>
                      <Th>Blood Type</Th>
                      <Th>Collection Date</Th>
                      <Th>Expiry Date</Th>
                      <Th>Days Left</Th>
                      <Th>Location</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {expiryData.units.slice(0, 10).map((unit) => (
                      <Tr key={unit.id}>
                        <Td fontWeight="medium">{unit.id}</Td>
                        <Td>
                          <Badge colorScheme={
                            unit.bloodType.includes('O') ? 'green' : 
                            unit.bloodType.includes('A') ? 'blue' : 
                            unit.bloodType.includes('B') ? 'orange' : 
                            'purple'
                          }>
                            {unit.bloodType}
                          </Badge>
                        </Td>
                        <Td>{unit.collectionDate}</Td>
                        <Td>{unit.expiryDate}</Td>
                        <Td>
                          <HStack>
                            <Text>{unit.daysUntilExpiry}</Text>
                            {getStatusBadge(unit.daysUntilExpiry)}
                          </HStack>
                        </Td>
                        <Td>{unit.location}</Td>
                        <Td>
                          <Badge colorScheme={unit.status === 'Available' ? 'green' : 'gray'}>
                            {unit.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <Tooltip label="View Details">
                              <IconButton
                                icon={<FiInfo />}
                                aria-label="View Details"
                                size="sm"
                                variant="ghost"
                              />
                            </Tooltip>
                            <Tooltip label="Discard Unit">
                              <IconButton
                                icon={<FiTrash2 />}
                                aria-label="Discard Unit"
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                              />
                            </Tooltip>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              
              {expiryData.units.length > 10 && (
                <Flex justify="center" mt={4}>
                  <Button size="sm" variant="outline">
                    View All {expiryData.units.length} Units
                  </Button>
                </Flex>
              )}
            </CardBody>
          </Card>
          
          <Alert status="info" mt={6} borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Recommendation</Text>
              <Text>
                {filterBloodType === 'all'
                  ? `${expiryData.stats.expiringWithin7Days} units are expiring within 7 days. Consider prioritizing usage of ${Object.entries(expiryData.stats.criticalTypeData)
                      .sort((a, b) => b[1].critical - a[1].critical)
                      .slice(0, 2)
                      .map(([type]) => type)
                      .join(' and ')} blood types.`
                  : `${expiryData.stats.expiringWithin7Days} units of ${filterBloodType} blood are expiring within 7 days. Consider prioritizing their usage or organizing a transfusion drive.`
                }
              </Text>
            </Box>
          </Alert>
        </>
      )}
    </Box>
  );
};

export default ExpiryReport;