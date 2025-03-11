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
  Tooltip
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
  FiInfo
} from 'react-icons/fi';
import AddStorageUnitModal from './AddStorageUnitModal';
import StorageTemperatureChart from './StorageTemperatureChart';

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
  
  const [storageUnits, setStorageUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedStorage, setSelectedStorage] = useState(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchStorageUnits();
  }, []);

  useEffect(() => {
    let result = [...storageUnits];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      result = result.filter(unit => 
        unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.storageUnitId.toLowerCase().includes(searchTerm.toLowerCase())
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
      setLoading(true);
      const response = await fetch('/api/inventory/storage');
      
      if (!response.ok) {
        throw new Error('Failed to fetch storage units');
      }
      
      const data = await response.json();
      setStorageUnits(data);
      setFilteredUnits(data);
    } catch (error) {
      console.error('Error fetching storage units:', error);
      toast({
        title: 'Error',
        description: 'Failed to load storage units. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStorageUnit = (newUnit) => {
    setStorageUnits(prevUnits => [...prevUnits, newUnit]);
    onAddModalClose();
    
    toast({
      title: 'Success',
      description: 'Storage unit added successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="lg">Storage Management</Heading>
        <Button 
          leftIcon={<FiPlus />} 
          colorScheme="blue" 
          onClick={onAddModalOpen}
        >
          Add Storage Unit
        </Button>
      </Flex>

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
              leftIcon={<FiRefreshCw />} 
              onClick={resetFilters}
              colorScheme="gray"
            >
              Reset Filters
            </Button>
          </Stack>
        </CardBody>
      </Card>

      {loading ? (
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
                                {unit.capacity.used} of {unit.capacity.total} {unit.capacity.units}
                              </Text>
                            </Flex>
                            <Progress 
                              value={unit.capacity.availablePercentage} 
                              colorScheme={
                                unit.capacity.availablePercentage > 70 ? "green" : 
                                unit.capacity.availablePercentage > 30 ? "yellow" : 
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
                                Current: {unit.currentTemperature.value}°{unit.temperature.units === 'Celsius' ? 'C' : 'F'}
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
                              {unit.temperature.min}° to {unit.temperature.max}° {unit.temperature.units === 'Celsius' ? 'C' : 'F'}
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
                  <Heading size="md">Temperature Monitoring</Heading>
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
                      
                      {selectedStorage && (
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
                              <StatNumber>{selectedStorage.currentTemperature?.value || '—'}°{selectedStorage.temperature.units === 'Celsius' ? 'C' : 'F'}</StatNumber>
                              <StatHelpText>
                                <Badge colorScheme={getTemperatureStatusColor(selectedStorage.currentTemperature?.status)}>
                                  {selectedStorage.currentTemperature?.status || 'Unknown'}
                                </Badge>
                              </StatHelpText>
                            </Stat>
                            
                            <Stat>
                              <StatLabel>Target Temperature</StatLabel>
                              <StatNumber>{selectedStorage.temperature.target}°{selectedStorage.temperature.units === 'Celsius' ? 'C' : 'F'}</StatNumber>
                              <StatHelpText>
                                Range: {selectedStorage.temperature.min}° to {selectedStorage.temperature.max}°
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
    </Box>
  );
};

export default StorageManagement;
