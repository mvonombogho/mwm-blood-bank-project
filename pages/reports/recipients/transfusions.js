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
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  chakra,
  Tooltip
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiArrowLeft, 
  FiList,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiUser,
  FiHospital,
  FiCheckCircle,
  FiClock,
  FiInfo
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

const TransfusionRecordsReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transfusions, setTransfusions] = useState([]);
  const [filteredTransfusions, setFilteredTransfusions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  useEffect(() => {
    // In a real app, you would fetch from an API
    // For now, we'll use mock data and simulate loading
    setTimeout(() => {
      const mockTransfusions = [
        {
          id: 'TRF-1001',
          recipientId: 'RCP-3045',
          recipientName: 'John Smith',
          bloodType: 'A+',
          hospital: 'Central Medical Center',
          doctor: 'Dr. Emily Johnson',
          units: 2,
          date: '2023-06-15',
          status: 'Completed',
          notes: 'Post-surgery transfusion',
          urgency: 'Normal'
        },
        {
          id: 'TRF-1002',
          recipientId: 'RCP-2987',
          recipientName: 'Mary Williams',
          bloodType: 'O-',
          hospital: 'City General Hospital',
          doctor: 'Dr. Robert Chen',
          units: 1,
          date: '2023-06-14',
          status: 'Completed',
          notes: 'Anemia treatment',
          urgency: 'Normal'
        },
        {
          id: 'TRF-1003',
          recipientId: 'RCP-3102',
          recipientName: 'David Johnson',
          bloodType: 'B+',
          hospital: 'Memorial Hospital',
          doctor: 'Dr. Sarah Ahmed',
          units: 3,
          date: '2023-06-14',
          status: 'Completed',
          notes: 'Emergency procedure',
          urgency: 'High'
        },
        {
          id: 'TRF-1004',
          recipientId: 'RCP-3078',
          recipientName: 'Patricia Brown',
          bloodType: 'AB+',
          hospital: 'Central Medical Center',
          doctor: 'Dr. Michael Lee',
          units: 1,
          date: '2023-06-16',
          status: 'Scheduled',
          notes: 'Pre-surgery preparation',
          urgency: 'Normal'
        },
        {
          id: 'TRF-1005',
          recipientId: 'RCP-2990',
          recipientName: 'Robert Miller',
          bloodType: 'O+',
          hospital: 'University Medical Center',
          doctor: 'Dr. Jennifer Wilson',
          units: 2,
          date: '2023-06-13',
          status: 'Completed',
          notes: 'Chronic condition management',
          urgency: 'Low'
        },
        {
          id: 'TRF-1006',
          recipientId: 'RCP-3150',
          recipientName: 'Jennifer Davis',
          bloodType: 'A-',
          hospital: 'City General Hospital',
          doctor: 'Dr. David Thompson',
          units: 2,
          date: '2023-06-16',
          status: 'In Progress',
          notes: 'Accident victim',
          urgency: 'High'
        },
        {
          id: 'TRF-1007',
          recipientId: 'RCP-3045',
          recipientName: 'John Smith',
          bloodType: 'A+',
          hospital: 'Central Medical Center',
          doctor: 'Dr. Emily Johnson',
          units: 1,
          date: '2023-06-10',
          status: 'Completed',
          notes: 'Follow-up transfusion',
          urgency: 'Normal'
        },
        {
          id: 'TRF-1008',
          recipientId: 'RCP-3112',
          recipientName: 'Michael Clark',
          bloodType: 'B-',
          hospital: 'Memorial Hospital',
          doctor: 'Dr. Lisa Garcia',
          units: 3,
          date: '2023-06-17',
          status: 'Scheduled',
          notes: 'Surgery preparation',
          urgency: 'Medium'
        },
        {
          id: 'TRF-1009',
          recipientId: 'RCP-3089',
          recipientName: 'Susan Anderson',
          bloodType: 'O+',
          hospital: 'University Medical Center',
          doctor: 'Dr. James Brown',
          units: 1,
          date: '2023-06-17',
          status: 'Scheduled',
          notes: 'Routine transfusion',
          urgency: 'Low'
        },
        {
          id: 'TRF-1010',
          recipientId: 'RCP-3160',
          recipientName: 'Thomas Wilson',
          bloodType: 'AB-',
          hospital: 'City General Hospital',
          doctor: 'Dr. Maria Rodriguez',
          units: 2,
          date: '2023-06-12',
          status: 'Completed',
          notes: 'Emergency procedure',
          urgency: 'High'
        }
      ];
      
      setTransfusions(mockTransfusions);
      setFilteredTransfusions(mockTransfusions);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Apply filters whenever search term, time range or status changes
  useEffect(() => {
    let results = transfusions;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(t => 
        t.recipientName.toLowerCase().includes(term) || 
        t.id.toLowerCase().includes(term) ||
        t.recipientId.toLowerCase().includes(term) ||
        t.hospital.toLowerCase().includes(term)
      );
    }
    
    // Apply time range filter
    if (timeRange !== 'all') {
      const today = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      
      results = results.filter(t => {
        const transfusionDate = new Date(t.date);
        const diffDays = Math.round(Math.abs((today - transfusionDate) / oneDay));
        
        switch(timeRange) {
          case 'today':
            return diffDays === 0;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      results = results.filter(t => t.status === statusFilter);
    }
    
    setFilteredTransfusions(results);
  }, [searchTerm, timeRange, statusFilter, transfusions]);
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'green';
      case 'In Progress':
        return 'blue';
      case 'Scheduled':
        return 'purple';
      default:
        return 'gray';
    }
  };
  
  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'High':
        return 'red';
      case 'Medium':
        return 'orange';
      case 'Normal':
        return 'blue';
      case 'Low':
        return 'green';
      default:
        return 'gray';
    }
  };
  
  const completedTransfusions = filteredTransfusions.filter(t => t.status === 'Completed');
  const totalUnits = filteredTransfusions.reduce((total, t) => total + t.units, 0);
  const uniqueRecipients = new Set(filteredTransfusions.map(t => t.recipientId)).size;
  
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
        <Heading as="h1" size="xl">Transfusion Records Report</Heading>
      </Flex>
      
      <Text color="gray.600" mb={6}>
        List of all blood transfusions administered and scheduled
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
                <Stat>
                  <StatLabel fontSize="md">Total Transfusions</StatLabel>
                  <StatNumber fontSize="3xl" color="blue.500">{filteredTransfusions.length}</StatNumber>
                  <StatHelpText>
                    In selected time period
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="md">Blood Units Used</StatLabel>
                  <StatNumber fontSize="3xl" color="red.500">{totalUnits}</StatNumber>
                  <StatHelpText>
                    {(totalUnits / filteredTransfusions.length).toFixed(1)} units per transfusion
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="md">Completed Transfusions</StatLabel>
                  <StatNumber fontSize="3xl" color="green.500">{completedTransfusions.length}</StatNumber>
                  <StatHelpText>
                    {Math.round(completedTransfusions.length / filteredTransfusions.length * 100)}% completion rate
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="md">Unique Recipients</StatLabel>
                  <StatNumber fontSize="3xl" color="purple.500">{uniqueRecipients}</StatNumber>
                  <StatHelpText>
                    Received blood products
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          <Card bg={bgColor} boxShadow="md" mb={6}>
            <CardHeader pb={0}>
              <Flex justify="space-between" direction={{ base: 'column', md: 'row' }} gap={4}>
                <Heading size="md">Transfusion Records</Heading>
                
                <HStack spacing={4}>
                  <InputGroup maxW="250px">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiSearch} color="gray.400" />
                    </InputLeftElement>
                    <Input 
                      placeholder="Search records..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  
                  <Select 
                    maxW="150px" 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    icon={<FiCalendar />}
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </Select>
                  
                  <Select 
                    maxW="150px" 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    icon={<FiFilter />}
                  >
                    <option value="all">All Status</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </Select>
                </HStack>
              </Flex>
            </CardHeader>
            <Divider mt={4} />
            <CardBody p={0}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Recipient</Th>
                    <Th>Date</Th>
                    <Th>Hospital</Th>
                    <Th>Blood Type</Th>
                    <Th>Units</Th>
                    <Th>Status</Th>
                    <Th>Urgency</Th>
                    <Th>Notes</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredTransfusions.length > 0 ? (
                    filteredTransfusions.map((transfusion) => (
                      <Tr key={transfusion.id}>
                        <Td fontWeight="medium">{transfusion.id}</Td>
                        <Td>
                          <Flex align="center">
                            <Icon as={FiUser} mr={2} />
                            <Box>
                              <Text>{transfusion.recipientName}</Text>
                              <Text fontSize="xs" color="gray.500">{transfusion.recipientId}</Text>
                            </Box>
                          </Flex>
                        </Td>
                        <Td>{transfusion.date}</Td>
                        <Td>
                          <Flex align="center">
                            <Icon as={FiHospital} mr={2} />
                            {transfusion.hospital}
                          </Flex>
                        </Td>
                        <Td>
                          <Badge colorScheme="red">{transfusion.bloodType}</Badge>
                        </Td>
                        <Td isNumeric>
                          <Badge colorScheme="blue" fontSize="sm">
                            {transfusion.units} {transfusion.units === 1 ? 'unit' : 'units'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(transfusion.status)}>
                            {transfusion.status === 'Completed' ? (
                              <Flex align="center">
                                <Icon as={FiCheckCircle} mr={1} />
                                {transfusion.status}
                              </Flex>
                            ) : transfusion.status === 'In Progress' ? (
                              <Flex align="center">
                                <Icon as={FiClock} mr={1} />
                                {transfusion.status}
                              </Flex>
                            ) : (
                              transfusion.status
                            )}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getUrgencyColor(transfusion.urgency)}>
                            {transfusion.urgency}
                          </Badge>
                        </Td>
                        <Td>
                          <Tooltip label={transfusion.notes}>
                            <Box>
                              <Icon as={FiInfo} />
                            </Box>
                          </Tooltip>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={9} textAlign="center" py={4}>
                        <Text>No transfusion records found matching your filters.</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Transfusions by Blood Type</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Blood Type</Th>
                      <Th isNumeric>Transfusions</Th>
                      <Th isNumeric>Units Used</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {[...new Set(filteredTransfusions.map(t => t.bloodType))].sort().map((bloodType) => {
                      const typeTransfusions = filteredTransfusions.filter(t => t.bloodType === bloodType);
                      const typeUnits = typeTransfusions.reduce((sum, t) => sum + t.units, 0);
                      
                      return (
                        <Tr key={bloodType}>
                          <Td>
                            <Badge colorScheme="red">{bloodType}</Badge>
                          </Td>
                          <Td isNumeric>{typeTransfusions.length}</Td>
                          <Td isNumeric>{typeUnits}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Transfusions by Hospital</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Hospital</Th>
                      <Th isNumeric>Transfusions</Th>
                      <Th isNumeric>Units Used</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {[...new Set(filteredTransfusions.map(t => t.hospital))].sort().map((hospital) => {
                      const hospitalTransfusions = filteredTransfusions.filter(t => t.hospital === hospital);
                      const hospitalUnits = hospitalTransfusions.reduce((sum, t) => sum + t.units, 0);
                      
                      return (
                        <Tr key={hospital}>
                          <Td>
                            <Flex align="center">
                              <Icon as={FiHospital} mr={2} />
                              {hospital}
                            </Flex>
                          </Td>
                          <Td isNumeric>{hospitalTransfusions.length}</Td>
                          <Td isNumeric>{hospitalUnits}</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          <Flex justify="space-between" mt={8}>
            <Text fontSize="sm" color="gray.500">
              Report generated: June 17, 2023
            </Text>
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                leftIcon={<FiDownload />}
              >
                Download PDF
              </Button>
              <Button
                colorScheme="green"
                leftIcon={<FiDownload />}
                variant="outline"
              >
                Export Excel
              </Button>
            </HStack>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default TransfusionRecordsReport;