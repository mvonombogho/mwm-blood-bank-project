import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  IconButton,
  Select,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Input,
  InputGroup,
  InputLeftElement,
  Radio,
  RadioGroup,
  Stack,
  Checkbox,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FiAlertTriangle, 
  FiTrash2, 
  FiArchive, 
  FiSearch, 
  FiFilter, 
  FiCalendar,
  FiRefreshCw
} from 'react-icons/fi';

const ExpiredUnitsManager = () => {
  const [expiredUnits, setExpiredUnits] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterValue, setFilterValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [actionNotes, setActionNotes] = useState('');
  const [disposalMethod, setDisposalMethod] = useState('standard');
  
  const toast = useToast();
  const { 
    isOpen: isActionModalOpen, 
    onOpen: onActionModalOpen, 
    onClose: onActionModalClose 
  } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  useEffect(() => {
    fetchExpiredUnits();
  }, []);
  
  const fetchExpiredUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current date for API query
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`/api/inventory/expiry-tracking?expired=true&date=${today}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch expired units');
      }
      
      const data = await response.json();
      
      // Extract the expiringUnits array from the response data
      setExpiredUnits(data.expiringUnits || []);
    } catch (err) {
      console.error('Error fetching expired units:', err);
      setError('Failed to load expired blood units. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectUnit = (unitId) => {
    setSelectedUnits(prev => {
      if (prev.includes(unitId)) {
        return prev.filter(id => id !== unitId);
      } else {
        return [...prev, unitId];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedUnits.length === filteredUnits.length) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits(filteredUnits.map(unit => unit._id));
    }
  };
  
  const openActionModal = () => {
    if (selectedUnits.length === 0) {
      toast({
        title: 'No units selected',
        description: 'Please select at least one unit to process',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setActionNotes('');
    setDisposalMethod('standard');
    onActionModalOpen();
  };
  
  const handleProcessUnits = async () => {
    if (selectedUnits.length === 0) return;
    
    setProcessingAction(true);
    
    try {
      // Process all selected units
      const response = await fetch('/api/inventory/blood-units/batch-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unitIds: selectedUnits,
          status: 'Discarded',
          notes: `Expired units discarded. Method: ${disposalMethod}. ${actionNotes}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process expired units');
      }
      
      // Show success notification
      toast({
        title: 'Units processed',
        description: `Successfully processed ${selectedUnits.length} expired unit(s)`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Clear selection and refresh data
      setSelectedUnits([]);
      fetchExpiredUnits();
      onActionModalClose();
    } catch (err) {
      console.error('Error processing expired units:', err);
      toast({
        title: 'Error',
        description: 'Failed to process expired units. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Filter and search functionality
  const filteredUnits = Array.isArray(expiredUnits) ? expiredUnits.filter(unit => {
    const matchesSearch = searchQuery === '' || 
      (unit.unitId && unit.unitId.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (unit.bloodType && unit.bloodType.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesFilter = filterValue === '' || unit.bloodType === filterValue;
    
    return matchesSearch && matchesFilter;
  }) : [];
  
  // Calculate stats
  const calculateStats = () => {
    if (!Array.isArray(expiredUnits)) {
      return {
        bloodTypeCount: {},
        totalUnits: 0,
        oldestUnit: null
      };
    }
    
    const bloodTypeCount = {};
    let totalUnits = 0;
    let oldestUnit = null;
    
    expiredUnits.forEach(unit => {
      // Count by blood type
      if (unit.bloodType) {
        if (bloodTypeCount[unit.bloodType]) {
          bloodTypeCount[unit.bloodType]++;
        } else {
          bloodTypeCount[unit.bloodType] = 1;
        }
      }
      
      // Total count
      totalUnits++;
      
      // Find oldest unit
      if (unit.expirationDate) {
        const expiryDate = new Date(unit.expirationDate);
        if (!oldestUnit || expiryDate < new Date(oldestUnit.expirationDate)) {
          oldestUnit = unit;
        }
      }
    });
    
    return {
      bloodTypeCount,
      totalUnits,
      oldestUnit
    };
  };
  
  const stats = calculateStats();
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };
  
  // Calculate days since expiry
  const getDaysSinceExpiry = (expiryDate) => {
    if (!expiryDate) return 'Unknown';
    
    try {
      const expiry = new Date(expiryDate);
      const today = new Date();
      const diffTime = today - expiry;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 'Unknown';
    }
  };
  
  return (
    <Box>
      <Heading as="h2" size="lg" mb={6}>Expired Blood Units Management</Heading>
      
      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Total Expired Units</StatLabel>
                  <StatNumber>{stats.totalUnits}</StatNumber>
                  <StatHelpText>
                    Requiring disposal action
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Selected for Processing</StatLabel>
                  <StatNumber>{selectedUnits.length}</StatNumber>
                  <StatHelpText>
                    of {filteredUnits.length} filtered units
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Oldest Expired Unit</StatLabel>
                  <StatNumber>
                    {stats.oldestUnit ? (
                      <Badge colorScheme="red">
                        {getDaysSinceExpiry(stats.oldestUnit.expirationDate)} days ago
                      </Badge>
                    ) : 'N/A'}
                  </StatNumber>
                  <StatHelpText>
                    {stats.oldestUnit ? formatDate(stats.oldestUnit.expirationDate) : ''}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Filters and Actions */}
          <Flex 
            wrap="wrap" 
            justify="space-between" 
            align="center" 
            mb={6} 
            gap={4}
          >
            <HStack spacing={4} flex={{ base: '1 0 100%', md: '1' }}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search by ID or blood type"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
              
              <Select 
                placeholder="Filter by blood type" 
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                maxW="200px"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </Select>
              
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={() => {
                  setSearchQuery('');
                  setFilterValue('');
                }}
                variant="outline"
              >
                Reset
              </Button>
            </HStack>
            
            <HStack spacing={4} flex={{ base: '1 0 100%', md: 'initial' }}>
              <Button
                colorScheme="red"
                leftIcon={<FiTrash2 />}
                onClick={openActionModal}
                isDisabled={selectedUnits.length === 0}
              >
                Process Selected
              </Button>
              
              <Button
                colorScheme="blue"
                leftIcon={<FiRefreshCw />}
                onClick={fetchExpiredUnits}
              >
                Refresh
              </Button>
            </HStack>
          </Flex>
          
          {/* Table */}
          <Card bg={bgColor} boxShadow="md" borderRadius="lg" mb={6}>
            <CardBody p={0}>
              {filteredUnits.length === 0 ? (
                <Flex direction="column" alignItems="center" justifyContent="center" py={10}>
                  <Text fontSize="lg" mb={4}>No expired units match your criteria</Text>
                  {searchQuery || filterValue ? (
                    <Button 
                      leftIcon={<FiRefreshCw />} 
                      onClick={() => {
                        setSearchQuery('');
                        setFilterValue('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Text color="gray.500">All expired units have been processed</Text>
                  )}
                </Flex>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th width="50px">
                          <Checkbox 
                            isChecked={selectedUnits.length === filteredUnits.length && filteredUnits.length > 0}
                            isIndeterminate={selectedUnits.length > 0 && selectedUnits.length < filteredUnits.length}
                            onChange={handleSelectAll}
                          />
                        </Th>
                        <Th>Unit ID</Th>
                        <Th>Blood Type</Th>
                        <Th>Collection Date</Th>
                        <Th>Expiration Date</Th>
                        <Th>Days Expired</Th>
                        <Th>Status</Th>
                        <Th>Location</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredUnits.map(unit => (
                        <Tr 
                          key={unit._id}
                          _hover={{ bg: 'gray.50' }}
                          bg={selectedUnits.includes(unit._id) ? 'blue.50' : undefined}
                        >
                          <Td>
                            <Checkbox 
                              isChecked={selectedUnits.includes(unit._id)}
                              onChange={() => handleSelectUnit(unit._id)}
                            />
                          </Td>
                          <Td fontWeight="medium">{unit.unitId}</Td>
                          <Td>
                            <Badge
                              colorScheme={
                                unit.bloodType?.includes('O') ? 'green' : 
                                unit.bloodType?.includes('A') ? 'blue' : 
                                unit.bloodType?.includes('B') ? 'orange' : 'purple'
                              }
                            >
                              {unit.bloodType}
                            </Badge>
                          </Td>
                          <Td>{formatDate(unit.collectionDate)}</Td>
                          <Td>{formatDate(unit.expirationDate)}</Td>
                          <Td>
                            <Badge colorScheme="red">
                              {getDaysSinceExpiry(unit.expirationDate)} days
                            </Badge>
                          </Td>
                          <Td>
                            <Badge colorScheme="yellow">
                              {unit.status}
                            </Badge>
                          </Td>
                          <Td>
                            {unit.location ? (
                              `${unit.location.facility}, ${unit.location.storageUnit}`
                            ) : (
                              <Text fontSize="sm" color="gray.500">Not specified</Text>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </CardBody>
          </Card>
          
          {/* Action Modal */}
          <Modal isOpen={isActionModalOpen} onClose={onActionModalClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Process Expired Units</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text mb={4}>
                  You are about to process {selectedUnits.length} expired blood unit(s).
                  This will mark them as discarded and remove them from available inventory.
                </Text>
                
                <FormControl mb={4}>
                  <FormLabel>Disposal Method</FormLabel>
                  <RadioGroup value={disposalMethod} onChange={setDisposalMethod}>
                    <Stack spacing={2}>
                      <Radio value="standard">Standard Biohazard Disposal</Radio>
                      <Radio value="incineration">Incineration</Radio>
                      <Radio value="medicalWaste">Medical Waste Service</Radio>
                      <Radio value="research">Research/Training Use</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Additional Notes</FormLabel>
                  <Textarea 
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    placeholder="Enter any additional notes about this processing action"
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onActionModalClose}>
                  Cancel
                </Button>
                <Button 
                  colorScheme="red" 
                  leftIcon={<FiTrash2 />}
                  onClick={handleProcessUnits}
                  isLoading={processingAction}
                >
                  Confirm Processing
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default ExpiredUnitsManager;