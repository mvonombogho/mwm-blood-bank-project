import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  Spinner,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
  HStack,
  InputGroup,
  InputLeftElement,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatGroup,
  SimpleGrid,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Divider,
  Textarea
} from '@chakra-ui/react';
import { FiEye, FiEdit, FiTrash2, FiSearch, FiFileText, FiCheck, FiX, FiAlertCircle, FiCalendar, FiFilter, FiRefreshCw } from 'react-icons/fi';
import AddBloodUnitModal from './AddBloodUnitModal';

const statusColorMap = {
  'Available': 'green',
  'Reserved': 'blue',
  'Quarantined': 'yellow',
  'Discarded': 'red',
  'Transfused': 'purple',
  'Expired': 'gray'
};

const EnhancedBloodUnitManagement = () => {
  const toast = useToast();
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();
  const { isOpen: isDetailModalOpen, onOpen: onDetailModalOpen, onClose: onDetailModalClose } = useDisclosure();
  const { isOpen: isUpdateStatusOpen, onOpen: onUpdateStatusOpen, onClose: onUpdateStatusClose } = useDisclosure();
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure();
  
  const cancelRef = useRef();
  
  const [bloodUnits, setBloodUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [error, setError] = useState(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Fetch blood units data
  useEffect(() => {
    fetchBloodUnits();
  }, []);

  // Apply filters
  useEffect(() => {
    if (!Array.isArray(bloodUnits)) {
      setFilteredUnits([]);
      return;
    }
    
    let result = [...bloodUnits];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      result = result.filter(unit => 
        unit.unitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (unit.location && unit.location.facility && unit.location.facility.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply status filter
    if (statusFilter !== '') {
      result = result.filter(unit => unit.status === statusFilter);
    }
    
    // Apply blood type filter
    if (bloodTypeFilter !== '') {
      result = result.filter(unit => unit.bloodType === bloodTypeFilter);
    }
    
    setFilteredUnits(result);
  }, [searchTerm, statusFilter, bloodTypeFilter, bloodUnits]);

  const fetchBloodUnits = async () => {
    try {
      setLoading(true);
      
      // Mock data for units
      const mockData = [
        {
          _id: "1",
          unitId: "BU-A-1001",
          bloodType: "A+",
          status: "Available",
          collectionDate: "2023-05-30",
          expirationDate: "2023-07-11",
          quantity: 450,
          location: {
            facility: "Main Blood Bank",
            storageUnit: "Refrigerator 1",
            shelf: "A",
            position: "3"
          },
          statusHistory: [
            {
              status: "Quarantined",
              date: "2023-05-30",
              updatedBy: "System",
              notes: "Initial status after collection"
            },
            {
              status: "Available",
              date: "2023-06-01",
              updatedBy: "TECH-104",
              notes: "All tests passed, cleared for use"
            }
          ]
        },
        {
          _id: "2",
          unitId: "BU-O-2045",
          bloodType: "O+",
          status: "Reserved",
          collectionDate: "2023-06-02",
          expirationDate: "2023-07-14",
          quantity: 450,
          location: {
            facility: "Main Blood Bank",
            storageUnit: "Refrigerator 2",
            shelf: "B",
            position: "1"
          },
          statusHistory: [
            {
              status: "Quarantined",
              date: "2023-06-02",
              updatedBy: "System",
              notes: "Initial status after collection"
            },
            {
              status: "Available",
              date: "2023-06-04",
              updatedBy: "TECH-107",
              notes: "All tests passed, cleared for use"
            },
            {
              status: "Reserved",
              date: "2023-06-10",
              updatedBy: "STAFF-201",
              notes: "Reserved for surgery at Central Hospital"
            }
          ]
        }
      ];
      
      try {
        // Try to fetch from API first
        const response = await fetch('/api/inventory/blood-units');
        
        if (!response.ok) {
          throw new Error('Failed to fetch blood units');
        }
        
        const data = await response.json();
        setBloodUnits(data);
        setFilteredUnits(data);
      } catch (apiError) {
        console.error('Error fetching blood units from API:', apiError);
        // Use mock data if API call fails
        setBloodUnits(mockData);
        setFilteredUnits(mockData);
      }
    } catch (error) {
      console.error('Error in blood units handling:', error);
      setError('An error occurred while loading blood units.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (unit) => {
    setSelectedUnit(unit);
    onDetailModalOpen();
  };

  const handleOpenStatusUpdate = (unit) => {
    setSelectedUnit(unit);
    setNewStatus('');
    setStatusNote('');
    onUpdateStatusOpen();
  };

  const handleOpenDeleteConfirmation = (unit) => {
    setSelectedUnit(unit);
    onDeleteAlertOpen();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateDaysUntilExpiry = (expirationDate) => {
    if (!expirationDate) return 'N/A';
    
    const expiry = new Date(expirationDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const renderExpiryStatus = (expirationDate) => {
    const daysLeft = calculateDaysUntilExpiry(expirationDate);
    
    if (daysLeft === 'N/A') return <Badge colorScheme="gray">Unknown</Badge>;
    
    if (daysLeft <= 0) {
      return <Badge colorScheme="red">Expired</Badge>;
    } else if (daysLeft <= 2) {
      return <Badge colorScheme="red">Critical: {daysLeft} day(s)</Badge>;
    } else if (daysLeft <= 7) {
      return <Badge colorScheme="orange">Warning: {daysLeft} days</Badge>;
    } else {
      return <Badge colorScheme="green">Good: {daysLeft} days</Badge>;
    }
  };

  // Main UI rendering
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="lg">Blood Unit Management</Heading>
        <Button 
          leftIcon={<FiFileText />} 
          colorScheme="blue" 
          onClick={onAddModalOpen}
        >
          Add New Blood Unit
        </Button>
      </Flex>

      {/* Filters section */}
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
                placeholder="Search by ID, blood type, or location" 
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
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Quarantined">Quarantined</option>
              <option value="Discarded">Discarded</option>
              <option value="Transfused">Transfused</option>
              <option value="Expired">Expired</option>
            </Select>
            
            <Select 
              placeholder="Filter by blood type" 
              value={bloodTypeFilter}
              onChange={(e) => setBloodTypeFilter(e.target.value)}
              maxW={{ base: '100%', md: '200px' }}
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
                setSearchTerm('');
                setStatusFilter('');
                setBloodTypeFilter('');
              }}
              colorScheme="gray"
            >
              Reset Filters
            </Button>
          </Stack>
        </CardBody>
      </Card>

      {/* Blood units table */}
      <Card bg={bgColor} boxShadow="md" borderRadius="lg">
        <CardBody p={0}>
          {loading ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : error ? (
            <Flex justify="center" align="center" h="200px" direction="column">
              <Text mb={4}>{error}</Text>
              <Button onClick={fetchBloodUnits} colorScheme="blue">
                Try Again
              </Button>
            </Flex>
          ) : !Array.isArray(filteredUnits) || filteredUnits.length === 0 ? (
            <Flex justify="center" align="center" h="200px" direction="column">
              <Text mb={4}>No blood units found matching your criteria.</Text>
              <Button onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setBloodTypeFilter('');
              }} colorScheme="blue" variant="outline">
                Reset Filters
              </Button>
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Unit ID</Th>
                    <Th>Blood Type</Th>
                    <Th>Status</Th>
                    <Th>Collection Date</Th>
                    <Th>Expiration</Th>
                    <Th>Storage Location</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredUnits.map((unit) => (
                    <Tr key={unit._id}>
                      <Td fontWeight="medium">{unit.unitId}</Td>
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
                      <Td>
                        <Badge colorScheme={statusColorMap[unit.status] || 'gray'}>
                          {unit.status}
                        </Badge>
                      </Td>
                      <Td>{formatDate(unit.collectionDate)}</Td>
                      <Td>{renderExpiryStatus(unit.expirationDate)}</Td>
                      <Td>{unit.location ? `${unit.location.facility} - ${unit.location.storageUnit}` : 'N/A'}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View Details">
                            <IconButton
                              icon={<FiEye />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleViewDetails(unit)}
                              aria-label="View details"
                            />
                          </Tooltip>
                          <Tooltip label="Update Status">
                            <IconButton
                              icon={<FiEdit />}
                              size="sm"
                              colorScheme="yellow"
                              variant="ghost"
                              onClick={() => handleOpenStatusUpdate(unit)}
                              aria-label="Update status"
                            />
                          </Tooltip>
                          <Tooltip label="Delete Unit">
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleOpenDeleteConfirmation(unit)}
                              aria-label="Delete unit"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Add Blood Unit Modal - placeholder */}
      <AddBloodUnitModal 
        isOpen={isAddModalOpen} 
        onClose={onAddModalClose} 
        onBloodUnitAdded={(newUnit) => {
          setBloodUnits(prevUnits => {
            // Ensure prevUnits is an array before spreading
            const units = Array.isArray(prevUnits) ? prevUnits : [];
            return [...units, newUnit];
          });
          onAddModalClose();
          toast({
            title: 'Success',
            description: 'Blood unit added successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }} 
      />

      {/* Other modals can be added here as needed */}
    </Box>
  );
};

export default EnhancedBloodUnitManagement;