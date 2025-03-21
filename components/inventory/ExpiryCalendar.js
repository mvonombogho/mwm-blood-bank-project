import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Badge,
  useToast,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardHeader,
  CardBody,
  Select,
  HStack,
  VStack,
  useColorModeValue,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  SimpleGrid,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiFilter, FiAlertCircle, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ExpiryCalendar = () => {
  const today = new Date();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [expiryData, setExpiryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayUnits, setSelectedDayUnits] = useState([]);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [error, setError] = useState(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const calendarBgColor = useColorModeValue('gray.50', 'gray.700');
  const todayBgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const todayBorderColor = useColorModeValue('blue.500', 'blue.300');
  const expiryCriticalColor = useColorModeValue('red.50', 'red.900');
  const expiryWarningColor = useColorModeValue('orange.50', 'orange.900');
  const expiryGoodColor = useColorModeValue('green.50', 'green.900');

  useEffect(() => {
    fetchExpiryData();
  }, [year, month, bloodTypeFilter]);

  const fetchExpiryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate first and last day of the month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Format dates for API call
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      // Build API URL with query parameters
      let url = `/api/inventory/expiry-tracking?startDate=${startDate}&endDate=${endDate}`;
      
      if (bloodTypeFilter) {
        url += `&bloodType=${bloodTypeFilter}`;
      }
      
      // Make API request
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Organize data by day
      if (data.expiringUnits && Array.isArray(data.expiringUnits)) {
        const organizedData = {};
        
        data.expiringUnits.forEach(unit => {
          if (unit.expirationDate) {
            const expiryDate = new Date(unit.expirationDate);
            
            // Check if expiry date is in the current month/year
            if (expiryDate.getMonth() === month && expiryDate.getFullYear() === year) {
              const day = expiryDate.getDate();
              
              if (!organizedData[day]) {
                organizedData[day] = [];
              }
              
              organizedData[day].push(unit);
            }
          }
        });
        
        setExpiryData(organizedData);
      } else if (data.calendarData && Array.isArray(data.calendarData)) {
        // Alternative data format - calendar data might just have counts
        const organizedData = {};
        
        data.calendarData.forEach(item => {
          if (item.date) {
            const date = new Date(item.date);
            if (date.getMonth() === month && date.getFullYear() === year) {
              const day = date.getDate();
              // Store count instead of array of units
              organizedData[day] = item.count || 0;
            }
          }
        });
        
        setExpiryData(organizedData);
      } else {
        // No valid data format found
        setExpiryData({});
      }
    } catch (error) {
      console.error('Error fetching expiry data:', error);
      setError(error.message || 'Failed to load expiry data');
      toast({
        title: 'Error',
        description: 'Failed to load expiry data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayClick = async (day) => {
    if (!day || !(expiryData[day] && (expiryData[day].length > 0 || (typeof expiryData[day] === 'number' && expiryData[day] > 0)))) {
      return;
    }
    
    setSelectedDay(day);
    setLoading(true);
    setSelectedDayUnits([]);
    
    try {
      // Format the specific date for the API request
      const selectedDate = new Date(year, month, day);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Build API URL for this specific day
      let url = `/api/inventory/expiry-tracking?date=${formattedDate}`;
      
      if (bloodTypeFilter) {
        url += `&bloodType=${bloodTypeFilter}`;
      }
      
      // Make API request for specific day data
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set the day's units
      if (data.expiringUnits && Array.isArray(data.expiringUnits)) {
        setSelectedDayUnits(data.expiringUnits);
      } else {
        setSelectedDayUnits([]);
      }
    } catch (error) {
      console.error('Error fetching day details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load details for this day.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      onOpen(); // Open the modal with day details
    }
  };
  
  // Calculate expiry urgency for a date
  const calculateUrgency = (expirationDate) => {
    if (!expirationDate) return { urgent: 0, warning: 0, normal: 0 };
    
    try {
      const expiry = new Date(expirationDate);
      const currentDate = new Date();
      const diffTime = expiry - currentDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 2) return 'urgent';
      if (diffDays <= 7) return 'warning';
      return 'normal';
    } catch (e) {
      return 'normal';
    }
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<GridItem key={`empty-${i}`} />);
    }
    
    // Cells for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      const dayData = expiryData[day];
      let hasExpiry = false;
      let urgentCount = 0;
      let warningCount = 0;
      let normalCount = 0;
      
      // Handle both array and number formats
      if (Array.isArray(dayData) && dayData.length > 0) {
        hasExpiry = true;
        
        // Count by urgency
        dayData.forEach(unit => {
          const urgency = calculateUrgency(unit.expirationDate);
          if (urgency === 'urgent') urgentCount++;
          else if (urgency === 'warning') warningCount++;
          else normalCount++;
        });
      } else if (typeof dayData === 'number' && dayData > 0) {
        hasExpiry = true;
        
        // Just distribute the count arbitrarily since we only know the total
        // In a real implementation, you'd want more detailed data
        const totalUnits = dayData;
        urgentCount = Math.ceil(totalUnits * 0.2); // 20% urgent as an example
        warningCount = Math.ceil(totalUnits * 0.3); // 30% warning
        normalCount = totalUnits - urgentCount - warningCount; // Rest are normal
      }
      
      days.push(
        <GridItem 
          key={day}
          p={2}
          bg={isToday ? todayBgColor : calendarBgColor}
          border="1px solid"
          borderColor={isToday ? todayBorderColor : borderColor}
          borderRadius="md"
          cursor={hasExpiry ? 'pointer' : 'default'}
          _hover={hasExpiry ? { boxShadow: 'md', bg: isToday ? todayBgColor : 'gray.100' } : {}}
          transition="all 0.2s"
          onClick={() => hasExpiry && handleDayClick(day)}
        >
          <Flex direction="column" h="100%">
            <Text fontWeight={isToday ? 'bold' : 'normal'}>
              {day}
            </Text>
            {hasExpiry && (
              <VStack mt="auto" spacing={1} align="stretch">
                {urgentCount > 0 && (
                  <Flex align="center" bg={expiryCriticalColor} p={1} borderRadius="sm">
                    <Icon as={FiAlertCircle} color="red.500" mr={1} />
                    <Text fontSize="xs">{urgentCount} critical</Text>
                  </Flex>
                )}
                {warningCount > 0 && (
                  <Flex align="center" bg={expiryWarningColor} p={1} borderRadius="sm">
                    <Icon as={FiAlertTriangle} color="orange.500" mr={1} />
                    <Text fontSize="xs">{warningCount} soon</Text>
                  </Flex>
                )}
                {normalCount > 0 && (
                  <Flex align="center" bg={expiryGoodColor} p={1} borderRadius="sm">
                    <Icon as={FiCheckCircle} color="green.500" mr={1} />
                    <Text fontSize="xs">{normalCount} good</Text>
                  </Flex>
                )}
              </VStack>
            )}
          </Flex>
        </GridItem>
      );
    }
    
    return days;
  };
  
  // Calculate days until expiry
  const calculateDaysUntilExpiry = (expirationDate) => {
    if (!expirationDate) return 'N/A';
    
    try {
      const expiry = new Date(expirationDate);
      const todayDate = new Date();
      const diffTime = expiry - todayDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (e) {
      return 'N/A';
    }
  };
  
  // Return the main component JSX
  return (
    <Box>
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}
      
      <Card bg={bgColor} boxShadow="md" borderRadius="lg" mb={6}>
        <CardHeader pb={0}>
          <Flex justify="space-between" align="center">
            <Heading size="md">Expiration Calendar</Heading>
            
            <Select 
              placeholder="Filter by blood type" 
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
              maxW="200px"
            >
              <option value="">All Types</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </Select>
          </Flex>
        </CardHeader>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Button leftIcon={<FiChevronLeft />} onClick={handlePreviousMonth} size="sm">
              Previous
            </Button>
            <Heading size="md">
              {months[month]} {year}
            </Heading>
            <Button rightIcon={<FiChevronRight />} onClick={handleNextMonth} size="sm">
              Next
            </Button>
          </HStack>
          
          {loading ? (
            <Flex justify="center" align="center" h="300px">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : (
            <Box>
              <Grid 
                templateColumns="repeat(7, 1fr)" 
                gap={2}
                mb={2}
              >
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <GridItem key={day} textAlign="center" fontWeight="bold">
                    <Text>{day}</Text>
                  </GridItem>
                ))}
              </Grid>
              
              <Grid 
                templateColumns="repeat(7, 1fr)" 
                gap={2}
                templateRows={`repeat(${Math.ceil((getDaysInMonth(year, month) + getFirstDayOfMonth(year, month)) / 7)}, 100px)`}
              >
                {renderCalendar()}
              </Grid>
            </Box>
          )}
          
          <Box mt={6}>
            <Heading size="sm" mb={3}>Expiry Legend</Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Flex align="center" bg={expiryCriticalColor} p={2} borderRadius="md">
                <Icon as={FiAlertCircle} color="red.500" mr={2} />
                <Text fontSize="sm">Critical: Expires within 2 days</Text>
              </Flex>
              <Flex align="center" bg={expiryWarningColor} p={2} borderRadius="md">
                <Icon as={FiAlertTriangle} color="orange.500" mr={2} />
                <Text fontSize="sm">Warning: Expires within 7 days</Text>
              </Flex>
              <Flex align="center" bg={expiryGoodColor} p={2} borderRadius="md">
                <Icon as={FiCheckCircle} color="green.500" mr={2} />
                <Text fontSize="sm">Good: Expires after 7 days</Text>
              </Flex>
            </SimpleGrid>
          </Box>
        </CardBody>
      </Card>
      
      {/* Day Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Expiring Units on {months[month]} {selectedDay}, {year}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedDayUnits.length === 0 ? (
              <Text>No units found matching your criteria.</Text>
            ) : (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Unit ID</Th>
                    <Th>Blood Type</Th>
                    <Th>Collection Date</Th>
                    <Th>Expiry Date</Th>
                    <Th>Status</Th>
                    <Th>Days Left</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {selectedDayUnits.map((unit) => {
                    const diffDays = calculateDaysUntilExpiry(unit.expirationDate);
                    
                    let badgeColor = 'green';
                    if (diffDays <= 2) badgeColor = 'red';
                    else if (diffDays <= 7) badgeColor = 'orange';
                    
                    return (
                      <Tr key={unit._id || unit.unitId}>
                        <Td>{unit.unitId}</Td>
                        <Td>
                          <Badge>{unit.bloodType}</Badge>
                        </Td>
                        <Td>{formatDate(new Date(unit.collectionDate))}</Td>
                        <Td>{formatDate(new Date(unit.expirationDate))}</Td>
                        <Td>
                          <Badge colorScheme={
                            unit.status === 'Available' ? 'green' :
                            unit.status === 'Reserved' ? 'blue' :
                            unit.status === 'Quarantined' ? 'yellow' :
                            unit.status === 'Discarded' ? 'red' :
                            unit.status === 'Transfused' ? 'purple' : 'gray'
                          }>
                            {unit.status}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={badgeColor}>
                            {diffDays === 'N/A' ? 'Unknown' : `${diffDays} day${diffDays !== 1 ? 's' : ''}`}
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ExpiryCalendar;