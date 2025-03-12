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
  Alert,
  AlertIcon,
  Progress,
  HStack,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiArrowLeft, 
  FiDroplet,
  FiAlertTriangle,
  FiCheck
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

const InventoryStatusReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Mock data for inventory status
  const [inventoryData, setInventoryData] = useState([]);
  
  const getStatusColor = (level) => {
    if (level < 20) return 'red';
    if (level < 50) return 'yellow';
    return 'green';
  };

  useEffect(() => {
    // In a real app, you would fetch from an API
    // For now, we'll use mock data and simulate loading
    setTimeout(() => {
      const mockInventoryData = [
        { 
          bloodType: 'A+', 
          unitsAvailable: 78, 
          capacity: 100,
          percentageFull: 78,
          expiringIn7Days: 5,
          status: 'Adequate',
          lastUpdated: '2023-06-17 09:25 AM',
        },
        { 
          bloodType: 'A-', 
          unitsAvailable: 32, 
          capacity: 50,
          percentageFull: 64,
          expiringIn7Days: 2,
          status: 'Adequate',
          lastUpdated: '2023-06-17 09:25 AM',
        },
        { 
          bloodType: 'B+', 
          unitsAvailable: 45, 
          capacity: 100,
          percentageFull: 45,
          expiringIn7Days: 4,
          status: 'Adequate',
          lastUpdated: '2023-06-17 09:25 AM',
        },
        { 
          bloodType: 'B-', 
          unitsAvailable: 12, 
          capacity: 50,
          percentageFull: 24,
          expiringIn7Days: 1,
          status: 'Low',
          lastUpdated: '2023-06-17 09:25 AM',
        },
        { 
          bloodType: 'AB+', 
          unitsAvailable: 28, 
          capacity: 50,
          percentageFull: 56,
          expiringIn7Days: 3,
          status: 'Adequate',
          lastUpdated: '2023-06-17 09:25 AM',
        },
        { 
          bloodType: 'AB-', 
          unitsAvailable: 7, 
          capacity: 25,
          percentageFull: 28,
          expiringIn7Days: 0,
          status: 'Low',
          lastUpdated: '2023-06-17 09:25 AM',
        },
        { 
          bloodType: 'O+', 
          unitsAvailable: 89, 
          capacity: 150,
          percentageFull: 59,
          expiringIn7Days: 10,
          status: 'Adequate',
          lastUpdated: '2023-06-17 09:25 AM',
        },
        { 
          bloodType: 'O-', 
          unitsAvailable: 6, 
          capacity: 50,
          percentageFull: 12,
          status: 'Critical',
          expiringIn7Days: 1,
          lastUpdated: '2023-06-17 09:25 AM',
        },
      ];
      
      setInventoryData(mockInventoryData);
      setLoading(false);
    }, 1000);
  }, []);
  
  return (
    <Box p={5}>
      <Flex align="center" mb={4}>
        <Button
          as={NextLink}
          href="/reports"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          mr={4}
        >
          Back to Reports
        </Button>
        <Heading as="h1" size="xl">Blood Inventory Status Report</Heading>
      </Flex>
      
      <Text color="gray.600" mb={6}>
        Current inventory levels by blood type, updated as of June 17, 2023
      </Text>
      
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
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6} mb={8}>
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Flex direction="column" align="center" textAlign="center">
                  <Text fontSize="lg" fontWeight="medium" mb={2}>Total Units Available</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="blue.500">
                    {inventoryData.reduce((sum, item) => sum + item.unitsAvailable, 0)}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Flex direction="column" align="center" textAlign="center">
                  <Text fontSize="lg" fontWeight="medium" mb={2}>Critical Blood Types</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="red.500">
                    {inventoryData.filter(item => item.status === 'Critical').length}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Flex direction="column" align="center" textAlign="center">
                  <Text fontSize="lg" fontWeight="medium" mb={2}>Expiring in 7 Days</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="orange.500">
                    {inventoryData.reduce((sum, item) => sum + item.expiringIn7Days, 0)}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Flex direction="column" align="center" textAlign="center">
                  <Text fontSize="lg" fontWeight="medium" mb={2}>Overall Capacity</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="green.500">
                    {Math.round(
                      (inventoryData.reduce((sum, item) => sum + item.unitsAvailable, 0) / 
                      inventoryData.reduce((sum, item) => sum + item.capacity, 0)) * 100
                    )}%
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          <Card bg={bgColor} boxShadow="md" mb={6}>
            <CardHeader>
              <Heading size="md">Blood Type Inventory Status</Heading>
            </CardHeader>
            <Divider />
            <CardBody p={0}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Blood Type</Th>
                    <Th>Units Available</Th>
                    <Th>Capacity</Th>
                    <Th>Status</Th>
                    <Th>Expiring Soon</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {inventoryData.map((item, index) => (
                    <Tr key={index}>
                      <Td>
                        <Flex align="center">
                          <Icon as={FiDroplet} color="red.500" mr={2} />
                          <Text fontWeight="medium">{item.bloodType}</Text>
                        </Flex>
                      </Td>
                      <Td>
                        <HStack spacing={4}>
                          <Text>{item.unitsAvailable} units</Text>
                          <Progress 
                            value={item.percentageFull} 
                            size="sm" 
                            width="100px" 
                            colorScheme={getStatusColor(item.percentageFull)} 
                          />
                        </HStack>
                      </Td>
                      <Td>{item.capacity} units</Td>
                      <Td>
                        {item.status === 'Critical' ? (
                          <Badge colorScheme="red">Critical</Badge>
                        ) : item.status === 'Low' ? (
                          <Badge colorScheme="yellow">Low</Badge>
                        ) : (
                          <Badge colorScheme="green">Adequate</Badge>
                        )}
                      </Td>
                      <Td>
                        {item.expiringIn7Days > 0 ? (
                          <Flex align="center">
                            <Icon as={FiAlertTriangle} color="orange.500" mr={2} />
                            <Text>{item.expiringIn7Days} units</Text>
                          </Flex>
                        ) : (
                          <Flex align="center">
                            <Icon as={FiCheck} color="green.500" mr={2} />
                            <Text>None</Text>
                          </Flex>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
          
          <Flex justify="space-between" mt={8}>
            <Text fontSize="sm" color="gray.500">
              Last updated: {inventoryData[0]?.lastUpdated || 'N/A'}
            </Text>
            <Button
              colorScheme="blue"
              leftIcon={<FiDownload />}
            >
              Download Report
            </Button>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default InventoryStatusReport;