import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  Icon,
  Flex,
  Stack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Select,
  FormControl,
  FormLabel,
  Input,
  HStack,
  useColorModeValue,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiBarChart2, 
  FiPieChart, 
  FiCalendar, 
  FiUsers, 
  FiDroplet, 
  FiList
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import axios from 'axios';
import NextLink from 'next/link';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Mock data for reports list
  const mockReports = [
    { 
      id: 1, 
      title: 'Monthly Donation Summary', 
      description: 'Overview of all donations for the current month',
      category: 'Donations',
      icon: FiBarChart2,
      lastGenerated: '2023-06-15',
      path: '/reports/donations/monthly'
    },
    { 
      id: 2, 
      title: 'Blood Inventory Status', 
      description: 'Current inventory levels by blood type',
      category: 'Inventory',
      icon: FiDroplet,
      lastGenerated: '2023-06-17',
      path: '/reports/inventory/status'
    },
    { 
      id: 3, 
      title: 'Donor Demographics', 
      description: 'Age, gender, and blood type distribution of donors',
      category: 'Donors',
      icon: FiUsers,
      lastGenerated: '2023-06-10',
      path: '/reports/donors/demographics'
    },
    { 
      id: 4, 
      title: 'Transfusion Records', 
      description: 'List of all blood transfusions administered',
      category: 'Recipients',
      icon: FiList,
      lastGenerated: '2023-06-12',
      path: '/reports/recipients/transfusions'
    },
    { 
      id: 5, 
      title: 'Expiry Forecast', 
      description: 'Projection of blood units set to expire in the next 30 days',
      category: 'Inventory',
      icon: FiCalendar,
      lastGenerated: '2023-06-16',
      path: '/reports/inventory/expiry'
    }
  ];
  
  useEffect(() => {
    // In a real app, you would fetch from an API
    // For now, we'll use mock data
    setReports(mockReports);
    setLoading(false);
  }, []);
  
  const getCategoryColor = (category) => {
    switch(category) {
      case 'Donations':
        return 'green';
      case 'Inventory':
        return 'blue';
      case 'Donors':
        return 'purple';
      case 'Recipients':
        return 'orange';
      default:
        return 'gray';
    }
  };
  
  return (
    <Box p={5}>
      <Heading as="h1" size="xl" mb={6}>Reports</Heading>
      
      <Flex 
        justify="space-between" 
        align="center" 
        mb={6}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Text fontSize="lg" color="gray.600">
          Generate and manage reports for donors, inventory, and transfusions.
        </Text>
        
        <HStack spacing={4}>
          <Button leftIcon={<FiBarChart2 />} colorScheme="blue">
            New Custom Report
          </Button>
          <Select placeholder="Filter by category" maxW="200px">
            <option value="all">All Categories</option>
            <option value="donations">Donations</option>
            <option value="inventory">Inventory</option>
            <option value="donors">Donors</option>
            <option value="recipients">Recipients</option>
          </Select>
        </HStack>
      </Flex>
      
      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            {/* Donation Statistics Card */}
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Donation Statistics</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <Stack spacing={4}>
                  <Flex justify="space-between">
                    <Text>Total Donations (This Month)</Text>
                    <Text fontWeight="bold">245</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Total Donors (This Month)</Text>
                    <Text fontWeight="bold">189</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Average Donations per Day</Text>
                    <Text fontWeight="bold">8.2</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Most Common Blood Type</Text>
                    <Badge colorScheme="green">O+</Badge>
                  </Flex>
                  <Button 
                    variant="outline" 
                    colorScheme="blue" 
                    leftIcon={<FiDownload />}
                    mt={2}
                  >
                    Download Report
                  </Button>
                </Stack>
              </CardBody>
            </Card>
            
            {/* Inventory Status Card */}
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Inventory Status</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <Stack spacing={4}>
                  <Flex justify="space-between">
                    <Text>Total Blood Units Available</Text>
                    <Text fontWeight="bold">1,234</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Critical Levels</Text>
                    <Badge colorScheme="red">3 Blood Types</Badge>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Expiring within 7 Days</Text>
                    <Text fontWeight="bold">28 units</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text>Storage Capacity</Text>
                    <Text fontWeight="bold">78% Full</Text>
                  </Flex>
                  <Button 
                    variant="outline" 
                    colorScheme="blue" 
                    leftIcon={<FiDownload />}
                    mt={2}
                  >
                    Download Report
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Available Reports */}
          <Heading as="h2" size="lg" mb={4}>Available Reports</Heading>
          <Card bg={bgColor} boxShadow="sm" mb={6}>
            <CardBody p={0}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Report Name</Th>
                    <Th>Category</Th>
                    <Th>Last Generated</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {reports.map((report) => (
                    <Tr key={report.id}>
                      <Td>
                        <Flex align="center">
                          <Icon 
                            as={report.icon} 
                            mr={3} 
                            color={`${getCategoryColor(report.category)}.500`} 
                          />
                          <Box>
                            <Text fontWeight="medium">{report.title}</Text>
                            <Text fontSize="sm" color="gray.500">{report.description}</Text>
                          </Box>
                        </Flex>
                      </Td>
                      <Td>
                        <Badge colorScheme={getCategoryColor(report.category)}>
                          {report.category}
                        </Badge>
                      </Td>
                      <Td>{report.lastGenerated}</Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          leftIcon={<FiBarChart2 />}
                          onClick={() => router.push(report.path)}
                          mr={2}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="green"
                          leftIcon={<FiDownload />}
                        >
                          Export
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
          
          {/* Custom Report Generator */}
          <Card bg={bgColor} boxShadow="md" mb={6}>
            <CardHeader>
              <Heading size="md">Generate Custom Report</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl>
                  <FormLabel>Report Type</FormLabel>
                  <Select placeholder="Select report type">
                    <option value="donations">Donations Report</option>
                    <option value="inventory">Inventory Report</option>
                    <option value="donors">Donor Report</option>
                    <option value="recipients">Recipient Report</option>
                    <option value="transfusions">Transfusion Report</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Date Range</FormLabel>
                  <HStack>
                    <Input type="date" placeholder="Start date" />
                    <Input type="date" placeholder="End date" />
                  </HStack>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Additional Filters</FormLabel>
                  <Select placeholder="Add filters">
                    <option value="bloodType">Blood Type</option>
                    <option value="location">Location</option>
                    <option value="donorType">Donor Type</option>
                    <option value="status">Status</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Output Format</FormLabel>
                  <Select defaultValue="pdf">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
              
              <Button
                mt={6}
                colorScheme="blue"
                leftIcon={<FiBarChart2 />}
              >
                Generate Report
              </Button>
            </CardBody>
          </Card>
        </>
      )}
    </Box>
  );
};

export default ReportsPage;