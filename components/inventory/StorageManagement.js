import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Grid,
  GridItem,
  Text,
  Badge,
  useDisclosure,
  Spinner,
  useToast,
  Stack,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  useColorModeValue,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  HStack,
  VStack,
  Tooltip,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiFilter, 
  FiRefreshCw, 
  FiThermometer, 
  FiAlertTriangle, 
  FiHome, 
  FiPackage, 
  FiPlus,
  FiEdit,
  FiTrash2,
  FiInfo,
  FiSettings
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AddStorageUnitModal from './AddStorageUnitModal';
import StorageTemperatureChart from './StorageTemperatureChart';
import AddTemperatureModal from './AddTemperatureModal';

const StatusBadge = ({ status }) => {
  const colorScheme = {
    'Operational': 'green',
    'Maintenance': 'yellow',
    'Malfunction': 'red',
    'Offline': 'gray'
  }[status] || 'gray';

  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};

const StorageManagement = () => {
  const toast = useToast();
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const { isOpen: isAddTempModalOpen, onOpen: onAddTempModalOpen, onClose: onAddTempModalClose } = useDisclosure();
  
  const [storageUnits, setStorageUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedStorage, setSelectedStorage] = useState(null);
  
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    fetchStorageUnits();
  }, [session]);

  useEffect(() => {
    if (!Array.isArray(storageUnits)) {
      setFilteredUnits([]);
      return;
    }
    
    let result = [...storageUnits];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      result = result.filter(unit => 
        (unit.name && unit.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (unit.facilityName && unit.facilityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (unit.storageUnitId && unit.storageUnitId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== '') {
      result = result.filter(unit => unit.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== '') {
      result = result.filter(unit => unit.type === typeFilter);
    }
    
    setFilteredUnits(result);
  }, [searchTerm, statusFilter, typeFilter, storageUnits]);

  const fetchStorageUnits = async () => {
    try {
      // Clear previous errors
      setLoading(true);
      setError(null);
      setPermissionError(null);

      // Check if user is authenticated
      if (sessionStatus !== 'authenticated') {
        setLoading(false);
        if (sessionStatus === 'unauthenticated') {
          setPermissionError('You must be logged in to view storage units');
        }
        return;
      }
      
      const response = await fetch('/api/inventory/storage', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        setPermissionError('Authentication required. Please sign in and try again.');
        setLoading(false);
        return;
      }

      if (response.status === 403) {
        setPermissionError('Insufficient permissions: You do not have access to manage inventory.');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch storage units');
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.warn('Unexpected data format:', data);
        setStorageUnits([]);
        setFilteredUnits([]);
      } else {
        setStorageUnits(data);
        setFilteredUnits(data);
      }
    } catch (err) {
      console.error('Error fetching storage units:', err);
      setError('Failed to load storage units. Please try again.');
      setStorageUnits([]);
      setFilteredUnits([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddStorageUnit = (newUnit) => {
    setStorageUnits(prevUnits => {
      const units = Array.isArray(prevUnits) ? prevUnits : [];
      return [...units, newUnit];
    });
    
    toast({
      title: 'Success',
      description: 'Storage unit added successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleLogTemperature = () => {
    if (!selectedStorage) {
      toast({
        title: 'No Storage Unit Selected',
        description: 'Please select a storage unit first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    onAddTempModalOpen();
  };

  const handleTemperatureAdded = () => {
    toast({
      title: 'Success',
      description: 'Temperature reading added successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Refresh storage units to get updated temperature
    fetchStorageUnits();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
  };

  const handleSelectStorage = (unit) => {
    setSelectedStorage(unit);
  };

  const getTemperatureStatusColor = (status) => {
    switch (status) {
      case 'Critical':
        return 'red';
      case 'Warning':
        return 'orange';
      case 'Normal':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Show loading state when session is loading
  if (sessionStatus === 'loading') {
    return (
      <Flex justify="center" align="center" h="300px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  // Show message if not authenticated
  if (sessionStatus === 'unauthenticated') {
    return (
      <Alert 
        status="warning" 
        variant="solid" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        textAlign="center" 
        height="200px"
        borderRadius="md"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Authentication Required
        </AlertTitle>
        <AlertDescription maxWidth="md">
          You need to be signed in to access the Storage Management feature.
          <Button 
            mt={4} 
            colorScheme="blue" 
            onClick={() => router.push('/auth/login')}
          >
            Sign In
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="lg">Storage Management</Heading>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="blue" 
          onClick={onAddModalOpen}
          isDisabled={permissionError !== null}
        >
          Add Storage Unit
        </Button>
      </Flex>

      {permissionError && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Permission Error</AlertTitle>
            <AlertDescription display="block">
              {permissionError}
              {permissionError.includes('permission') && (
                <Text mt={2}>
                  Please contact your administrator to request inventory management permissions.
                </Text>
              )}
            </AlertDescription>
          </Box>
          <Button colorScheme="red" size="sm" onClick={() => router.push('/auth/login')}>
            Re-authenticate
          </Button>
        </Alert>
      )}

      <Card bg={bgColor} boxShadow="md" borderRadius="lg" mb={6}>
        <CardHeader pb={2}>
          <Heading size="md">Filters</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="Search by name, facility, or ID" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Select 
              placeholder="Filter by status" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              maxW={{ base: '100%', md: '200px' }}
            >
              <option value="Operational">Operational</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Malfunction">Malfunction</option>
              <option value="Offline">Offline</option>
            </Select>
            
            <Select 
              placeholder="Filter by type" 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              maxW={{ base: '100%', md: '200px' }}
            >
              <option value="Refrigerator">Refrigerator</option>
              <option value="Freezer">Freezer</option>
              <option value="Room Temperature Storage">Room Temperature Storage</option>
              <option value="Deep Freezer">Deep Freezer</option>
              <option value="Transport Cooler">Transport Cooler</option>
              <option value="Other">Other</option>
            </Select>
            
            <Button 
              leftIcon={<FiFilter />} 
              onClick={resetFilters}
              colorScheme="gray"
            >
              Reset Filters
            </Button>

            <Button 
              leftIcon={<FiRefreshCw />} 
              onClick={fetchStorageUnits}
              colorScheme="blue"
              variant="outline"
              isLoading={loading}
            >
              Refresh
            </Button>
          </Stack>
        </CardBody>
      </Card>

      {error && !permissionError && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
          <Button colorScheme="red" size="sm" onClick={fetchStorageUnits}>
            Try Again
          </Button>
        </Alert>
      )}

      {loading && !permissionError ? (
        <Flex justify="center" align="center" h="300px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <Tabs isFitted variant="enclosed">
          <TabList mb={4}>
            <Tab>Grid View</Tab>
            <Tab>Temperature Monitoring</Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel p={0}>
              {filteredUnits.length === 0 ? (
                <Flex justify="center" align="center" h="200px" direction="column">
                  <Text mb={4}>No storage units found matching your criteria.</Text>
                  <Button onClick={resetFilters} colorScheme="blue" variant="outline">
                    Reset Filters
                  </Button>
                </Flex>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredUnits.map((unit) => (
                    <Card 
                      key={unit._id} 
                      bg={bgColor} 
                      boxShadow="md" 
                      borderRadius="lg"
                      _hover={{ boxShadow: 'lg', bg: cardHoverBg }}
                      transition="all 0.2s"
                      onClick={() => handleSelectStorage(unit)}
                      cursor="pointer"
                      borderWidth="2px"
                      borderColor={selectedStorage?._id === unit._id ? 'blue.500' : 'transparent'}
                    >
                      <CardHeader pb={2}>
                        <Flex justify="space-between" align="center">
                          <Box>
                            <Heading size="md">{unit.name}</Heading>
                            <Text fontSize="sm" color="gray.500">{unit.storageUnitId}</Text>
                          </Box>
                          <StatusBadge status={unit.status} />
                        </Flex>
                      </CardHeader>
                      
                      <CardBody py={2}>
                        <VStack align="stretch" spacing={3}>
                          <HStack>
                            <Icon as={FiHome} color="blue.500" />
                            <Text>{unit.facilityName}</Text>
                          </HStack>
                          
                          <HStack>
                            <Icon as={FiPackage} color="green.500" />
                            <Text>{unit.type}</Text>
                          </HStack>
                          
                          <Box>
                            <Flex justify="space-between" mb={1}>
                              <Text fontSize="sm">Capacity Usage</Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {unit.capacity?.used || 0} of {unit.capacity?.total || 0} {unit.capacity?.units || 'Units'}
                              </Text>
                            </Flex>
                            <Progress 
                              value={unit.capacity?.availablePercentage || 100} 
                              colorScheme={
                                (unit.capacity?.availablePercentage || 100) > 70 ? "green" : 
                                (unit.capacity?.availablePercentage || 100) > 30 ? "yellow" : 
                                "red"
                              }
                              size="sm"
                              borderRadius="md"
                            />
                          </Box>
                          
                          {unit.currentTemperature && (
                            <HStack>
                              <Icon as={FiThermometer} color={
                                getTemperatureStatusColor(unit.currentTemperature.status)
                              } />
                              <Text>
                                Current: {unit.currentTemperature.value}°{unit.temperature?.units === 'Celsius' ? 'C' : 'F'}
                              </Text>
                              {unit.currentTemperature.status !== 'Normal' && (
                                <Badge colorScheme={getTemperatureStatusColor(unit.currentTemperature.status)}>
                                  {unit.currentTemperature.status}
                                </Badge>
                              )}
                            </HStack>
                          )}
                          
                          <Box>
                            <Text fontSize="sm" mb={1}>Temperature Range:</Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {unit.temperature?.min || 0}° to {unit.temperature?.max || 0}° {unit.temperature?.units === 'Celsius' ? 'C' : 'F'}
                            </Text>
                          </Box>
                        </VStack>
                      </CardBody>
                      
                      <CardFooter pt={0}>
                        <HStack spacing={2}>
                          <Button 
                            leftIcon={<FiInfo />} 
                            size="sm" 
                            colorScheme="blue" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle view details
                            }}
                          >
                            Details
                          </Button>
                          <IconButton
                            icon={<FiEdit />}
                            size="sm"
                            colorScheme="yellow"
                            variant="ghost"
                            aria-label="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle edit
                            }}
                          />
                          <IconButton
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            aria-label="Delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle delete
                            }}
                          />
                        </HStack>
                      </CardFooter>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
            
            <TabPanel p={0}>
              <Card bg={bgColor} boxShadow="md" borderRadius="lg" mb={6}>
                <CardHeader pb={0}>
                  <Flex justify="space-between" align="center">
                    <Heading size="md">Temperature Monitoring</Heading>
                    
                    {selectedStorage && (
                      <Button 
                        leftIcon={<FiThermometer />} 
                        colorScheme="teal" 
                        size="sm"
                        onClick={handleLogTemperature}
                      >
                        Log Temperature
                      </Button>
                    )}
                  </Flex>
                </CardHeader>
                <CardBody>
                  {filteredUnits.length === 0 ? (
                    <Flex justify="center" align="center" h="200px">
                      <Text>No storage units to display temperature data</Text>
                    </Flex>
                  ) : (
                    <Box>
                      <Text mb={4}>Select a storage unit to view temperature history:</Text>
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3} mb={6}>
                        {filteredUnits.map(unit => (
                          <Button 
                            key={unit._id}
                            onClick={() => handleSelectStorage(unit)}
                            colorScheme={selectedStorage?._id === unit._id ? "blue" : "gray"}
                            variant={selectedStorage?._id === unit._id ? "solid" : "outline"}
                            size="sm"
                            justifyContent="flex-start"
                            leftIcon={<FiThermometer />}
                          >
                            {unit.name} ({unit.facilityName})
                          </Button>
                        ))}
                      </SimpleGrid>
                      
                      {selectedStorage ? (
                        <Box>
                          <Flex justify="space-between" align="center" mb={4}>
                            <Heading size="sm">{selectedStorage.name} Temperature History</Heading>
                            <HStack>
                              <Text fontSize="sm">Status:</Text>
                              <StatusBadge status={selectedStorage.status} />
                            </HStack>
                          </Flex>
                          
                          <StorageTemperatureChart storageUnitId={selectedStorage.storageUnitId} />
                          
                          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={6}>
                            <Stat>
                              <StatLabel>Current Temperature</StatLabel>
                              <StatNumber>{selectedStorage.currentTemperature?.value || '—'}°{selectedStorage.temperature?.units === 'Celsius' ? 'C' : 'F'}</StatNumber>
                              <StatHelpText>
                                <Badge colorScheme={getTemperatureStatusColor(selectedStorage.currentTemperature?.status)}>
                                  {selectedStorage.currentTemperature?.status || 'Unknown'}
                                </Badge>
                              </StatHelpText>
                            </Stat>
                            
                            <Stat>
                              <StatLabel>Target Temperature</StatLabel>
                              <StatNumber>{selectedStorage.temperature?.target || '—'}°{selectedStorage.temperature?.units === 'Celsius' ? 'C' : 'F'}</StatNumber>
                              <StatHelpText>
                                Range: {selectedStorage.temperature?.min || '—'}° to {selectedStorage.temperature?.max || '—'}°
                              </StatHelpText>
                            </Stat>
                            
                            <Stat>
                              <StatLabel>Monitoring Frequency</StatLabel>
                              <StatNumber>
                                {selectedStorage.monitoring?.monitoringFrequency || '—'} <Text as="span" fontSize="md">min</Text>
                              </StatNumber>
                              <StatHelpText>
                                {selectedStorage.monitoring?.autoLogging ? 'Auto-logging enabled' : 'Manual logging'}
                              </StatHelpText>
                            </Stat>
                          </SimpleGrid>
                        </Box>
                      ) : (
                        <Flex justify="center" align="center" h="200px">
                          <Text>Please select a storage unit to view temperature data</Text>
                        </Flex>
                      )}
                    </Box>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      {/* Add Storage Unit Modal */}
      <AddStorageUnitModal 
        isOpen={isAddModalOpen} 
        onClose={onAddModalClose} 
        onStorageUnitAdded={handleAddStorageUnit} 
      />

      {/* Add Temperature Reading Modal */}
      {selectedStorage && (
        <AddTemperatureModal
          isOpen={isAddTempModalOpen}
          onClose={onAddTempModalClose}
          storageUnit={selectedStorage}
          onTemperatureAdded={handleTemperatureAdded}
        />
      )}
    </Box>
  );
};

export default StorageManagement;