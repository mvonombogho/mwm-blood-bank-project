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
  Textarea,
  Alert,
  AlertIcon
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
      
      // Fetch data from API
      const response = await fetch('/api/inventory/blood-units');
      
      if (!response.ok) {
        throw new Error('Failed to fetch blood units');
      }
      
      const data = await response.json();
      // Ensure we're getting the blood units array from the response
      const units = data.bloodUnits || data;
      
      setBloodUnits(units);
      setFilteredUnits(units);
    } catch (error) {
      console.error('Error fetching blood units:', error);
      setError('An error occurred while loading blood units.');
      setBloodUnits([]);
      setFilteredUnits([]);
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

  const handleUpdateStatus = async () => {
    if (!selectedUnit || !newStatus) return;

    try {
      // API call to update status
      const response = await fetch(`/api/inventory/blood-units/${selectedUnit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          statusNote: statusNote,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      const updatedUnits = bloodUnits.map(unit => 
        unit._id === selectedUnit._id ? { ...unit, status: newStatus } : unit
      );
      
      setBloodUnits(updatedUnits);
      
      toast({
        title: 'Status updated',
        description: `Blood unit ${selectedUnit.unitId} status changed to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onUpdateStatusClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blood unit status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUnit = async () => {
    if (!selectedUnit) return;

    try {
      // API call to delete
      const response = await fetch(`/api/inventory/blood-units/${selectedUnit._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete unit');
      }

      // Update local state
      const updatedUnits = bloodUnits.filter(unit => unit._id !== selectedUnit._id);
      setBloodUnits(updatedUnits);
      
      toast({
        title: 'Unit deleted',
        description: `Blood unit ${selectedUnit.unitId} has been deleted`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onDeleteAlertClose();
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blood unit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Helper function to safely display storage location
  const displayStorageLocation = (unit) => {
    if (!unit.location) return 'N/A';
    
    // Check if both facility and storage unit exist
    if (unit.location.facility && unit.location.storageUnit) {
      return `${unit.location.facility} - ${unit.location.storageUnit}`;
    }
    
    // If only facility exists
    if (unit.location.facility) {
      return unit.location.facility;
    }
    
    // If only storage unit exists
    if (unit.location.storageUnit) {
      return unit.location.storageUnit;
    }
    
    // If location object exists but no data inside
    return 'N/A';
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

      {/* Alert about changes */}
      <Alert status="info" mb={4} borderRadius="md">
        <AlertIcon />
        Storage location is now optional. Donor information has been removed from the blood unit management.
      </Alert>

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
                placeholder="Search by ID or blood type" 
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
                fetchBloodUnits();
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
                      <Td>{displayStorageLocation(unit)}</Td>
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

      {/* Add Blood Unit Modal */}
      <AddBloodUnitModal 
        isOpen={isAddModalOpen} 
        onClose={onAddModalClose} 
        onBloodUnitAdded={(newUnit) => {
          // Update local state with the new blood unit
          setBloodUnits(prevUnits => {
            const units = Array.isArray(prevUnits) ? prevUnits : [];
            return [...units, newUnit];
          });
          
          // Display success toast
          toast({
            title: 'Success',
            description: 'Blood unit added successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          
          // Close the modal
          onAddModalClose();
        }} 
      />

      {/* Blood Unit Details Modal */}
      <Modal isOpen={isDetailModalOpen} onClose={onDetailModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Blood Unit Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUnit && (
              <Tabs colorScheme="blue">
                <TabList>
                  <Tab>Basic Info</Tab>
                  <Tab>Status History</Tab>
                  {selectedUnit.location && <Tab>Storage</Tab>}
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box>
                        <Text fontWeight="bold">Unit ID:</Text>
                        <Text>{selectedUnit.unitId}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Blood Type:</Text>
                        <Text>{selectedUnit.bloodType}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Status:</Text>
                        <Badge colorScheme={statusColorMap[selectedUnit.status] || 'gray'}>
                          {selectedUnit.status}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Quantity:</Text>
                        <Text>{selectedUnit.quantity} ml</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Collection Date:</Text>
                        <Text>{formatDate(selectedUnit.collectionDate)}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold">Expiration Date:</Text>
                        <Text>{formatDate(selectedUnit.expirationDate)}</Text>
                      </Box>
                      {selectedUnit.notes && (
                        <Box gridColumn={{ md: "span 2" }}>
                          <Text fontWeight="bold">Notes:</Text>
                          <Text>{selectedUnit.notes}</Text>
                        </Box>
                      )}
                    </SimpleGrid>
                  </TabPanel>

                  <TabPanel>
                    {selectedUnit.statusHistory && selectedUnit.statusHistory.length > 0 ? (
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Status</Th>
                            <Th>Date</Th>
                            <Th>Updated By</Th>
                            <Th>Notes</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {selectedUnit.statusHistory.map((history, index) => (
                            <Tr key={index}>
                              <Td>
                                <Badge colorScheme={statusColorMap[history.status] || 'gray'}>
                                  {history.status}
                                </Badge>
                              </Td>
                              <Td>{formatDate(history.date)}</Td>
                              <Td>{history.updatedBy || 'N/A'}</Td>
                              <Td>{history.notes || 'N/A'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text>No status history available.</Text>
                    )}
                  </TabPanel>

                  {selectedUnit.location && (
                    <TabPanel>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text fontWeight="bold">Facility:</Text>
                          <Text>{selectedUnit.location.facility || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Storage Unit:</Text>
                          <Text>{selectedUnit.location.storageUnit || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Shelf:</Text>
                          <Text>{selectedUnit.location.shelf || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Position:</Text>
                          <Text>{selectedUnit.location.position || 'N/A'}</Text>
                        </Box>
                      </SimpleGrid>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onDetailModalClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Update Status Modal */}
      <Modal isOpen={isUpdateStatusOpen} onClose={onUpdateStatusClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Blood Unit Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUnit && (
              <Box>
                <Text mb={4}>
                  Current status: <Badge colorScheme={statusColorMap[selectedUnit.status] || 'gray'}>
                    {selectedUnit.status}
                  </Badge>
                </Text>

                <FormControl id="newStatus" isRequired mb={4}>
                  <FormLabel>New Status</FormLabel>
                  <Select 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    placeholder="Select new status"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Quarantined">Quarantined</option>
                    <option value="Discarded">Discarded</option>
                    <option value="Transfused">Transfused</option>
                    <option value="Expired">Expired</option>
                  </Select>
                </FormControl>

                <FormControl id="statusNote" mb={4}>
                  <FormLabel>Notes (optional)</FormLabel>
                  <Textarea 
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add notes about this status change"
                  />
                </FormControl>
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onUpdateStatusClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleUpdateStatus}
              isDisabled={!newStatus}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Blood Unit
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the blood unit "{selectedUnit?.unitId}"? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteUnit} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default EnhancedBloodUnitManagement;