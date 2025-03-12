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
  HStack,
  useColorModeValue,
  Select
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiArrowLeft, 
  FiCalendar,
  FiAlertTriangle,
  FiAlertCircle
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

const InventoryExpiryReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30');
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Mock data for expiring inventory
  const [expiryData, setExpiryData] = useState([]);
  
  const getUrgencyColor = (daysLeft) => {
    if (daysLeft <= 7) return 'red';
    if (daysLeft <= 14) return 'orange';
    return 'yellow';
  };

  useEffect(() => {
    // In a real app, you would fetch from an API
    // For now, we'll use mock data and simulate loading
    setTimeout(() => {
      const mockExpiryData = [
        { 
          id: 'BU-A-1001',
          bloodType: 'A+', 
          dateDonated: '2023-05-25',
          expiryDate: '2023-07-06',
          daysLeft: 19,
          location: 'Refrigerator 1, Shelf A',
          donorId: 'D-10045',
          status: 'Available'
        },
        { 
          id: 'BU-A-1002',
          bloodType: 'A+', 
          dateDonated: '2023-05-28',
          expiryDate: '2023-07-09',
          daysLeft: 22,
          location: 'Refrigerator 1, Shelf A',
          donorId: 'D-10062',
          status: 'Available'
        },
        { 
          id: 'BU-A-985',
          bloodType: 'A-', 
          dateDonated: '2023-05-20',
          expiryDate: '2023-07-01',
          daysLeft: 14,
          location: 'Refrigerator 1, Shelf B',
          donorId: 'D-10021',
          status: 'Available'
        },
        { 
          id: 'BU-B-567',
          bloodType: 'B+', 
          dateDonated: '2023-05-15',
          expiryDate: '2023-06-26',
          daysLeft: 9,
          location: 'Refrigerator 2, Shelf A',
          donorId: 'D-9876',
          status: 'Available'
        },
        { 
          id: 'BU-B-570',
          bloodType: 'B-', 
          dateDonated: '2023-05-10',
          expiryDate: '2023-06-21',
          daysLeft: 4,
          location: 'Refrigerator 2, Shelf B',
          donorId: 'D-9912',
          status: 'Available'
        },
        { 
          id: 'BU-AB-245',
          bloodType: 'AB+', 
          dateDonated: '2023-05-22',
          expiryDate: '2023-07-03',
          daysLeft: 16,
          location: 'Refrigerator 3, Shelf A',
          donorId: 'D-10077',
          status: 'Available'
        },
        { 
          id: 'BU-O-782',
          bloodType: 'O+', 
          dateDonated: '2023-05-12',
          expiryDate: '2023-06-23',
          daysLeft: 6,
          location: 'Refrigerator 4, Shelf A',
          donorId: 'D-9945',
          status: 'Available'
        },
        { 
          id: 'BU-O-789',
          bloodType: 'O-', 
          dateDonated: '2023-05-08',
          expiryDate: '2023-06-19',
          daysLeft: 2,
          location: 'Refrigerator 4, Shelf B',
          donorId: 'D-9920',
          status: 'Available'
        },
        { 
          id: 'BU-O-790',
          bloodType: 'O-', 
          dateDonated: '2023-05-06',
          expiryDate: '2023-06-17',
          daysLeft: 0,
          location: 'Refrigerator 4, Shelf B',
          donorId: 'D-9905',
          status: 'Expired'
        },
      ];
      
      setExpiryData(mockExpiryData);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Filter data based on selected timeframe
  const filteredData = expiryData.filter(item => 
    item.daysLeft <= parseInt(timeframe) || item.status === 'Expired'
  );
  
  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };
  
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
        <Heading as="h1" size="xl">Blood Inventory Expiry Forecast</Heading>
      </Flex>
      
      <Text color="gray.600" mb={6}>
        Projection of blood units set to expire in the coming days
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
          <Flex 
            justify="space-between" 
            align="center" 
            mb={6}
            direction={{ base: 'column', md: 'row' }}
            gap={4}
          >
            <Text>
              Showing blood units expiring within:
            </Text>
            <HStack spacing={4}>
              <Select 
                value={timeframe} 
                onChange={handleTimeframeChange}
                maxW="200px"
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
              </Select>
              <Button
                colorScheme="blue"
                leftIcon={<FiDownload />}
              >
                Download Report
              </Button>
            </HStack>
          </Flex>
          
          <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6} mb={8}>
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Flex direction="column" align="center" textAlign="center">
                  <Text fontSize="lg" fontWeight="medium" mb={2}>Expiring Units</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="yellow.500">
                    {filteredData.length}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Flex direction="column" align="center" textAlign="center">
                  <Text fontSize="lg" fontWeight="medium" mb={2}>Critical (≤ 7 days)</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="red.500">
                    {filteredData.filter(item => item.daysLeft <= 7 && item.status !== 'Expired').length}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Flex direction="column" align="center" textAlign="center">
                  <Text fontSize="lg" fontWeight="medium" mb={2}>Expired Units</Text>
                  <Text fontSize="4xl" fontWeight="bold" color="gray.500">
                    {filteredData.filter(item => item.status === 'Expired').length}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          <Card bg={bgColor} boxShadow="md" mb={6}>
            <CardHeader>
              <Heading size="md">Expiring Blood Units</Heading>
            </CardHeader>
            <Divider />
            <CardBody p={0}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Unit ID</Th>
                    <Th>Blood Type</Th>
                    <Th>Expiry Date</Th>
                    <Th>Days Left</Th>
                    <Th>Location</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredData.map((item) => (
                    <Tr key={item.id}>
                      <Td fontWeight="medium">{item.id}</Td>
                      <Td>
                        <Badge colorScheme="red">{item.bloodType}</Badge>
                      </Td>
                      <Td>{item.expiryDate}</Td>
                      <Td>
                        {item.status === 'Expired' ? (
                          <Flex align="center">
                            <Icon as={FiAlertCircle} color="red.500" mr={2} />
                            <Text color="red.500">Expired</Text>
                          </Flex>
                        ) : (
                          <Flex align="center">
                            <Icon 
                              as={FiAlertTriangle} 
                              color={`${getUrgencyColor(item.daysLeft)}.500`} 
                              mr={2} 
                            />
                            <Text>{item.daysLeft} days</Text>
                          </Flex>
                        )}
                      </Td>
                      <Td>{item.location}</Td>
                      <Td>
                        {item.status === 'Expired' ? (
                          <Badge colorScheme="red">Expired</Badge>
                        ) : (
                          <Badge colorScheme="green">Available</Badge>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
          
          <Alert status="info" mb={6}>
            <AlertIcon />
            <Text>
              Blood units typically expire 42 days after donation. Units approaching expiry should be prioritized for use to minimize waste.
            </Text>
          </Alert>
          
          <Flex justify="space-between" mt={8}>
            <Text fontSize="sm" color="gray.500">
              Report generated: June 17, 2023
            </Text>
            <Button
              colorScheme="blue"
              leftIcon={<FiCalendar />}
              onClick={() => router.push('/inventory')}
            >
              Go to Inventory
            </Button>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default InventoryExpiryReport;