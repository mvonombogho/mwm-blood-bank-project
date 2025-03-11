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
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Fetch blood units data
  useEffect(() => {
    fetchBloodUnits();
  }, []);

  // Apply filters
  useEffect(() => {
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
      const response = await fetch('/api/inventory/blood-units');
      
      if (!response.ok) {
        throw new Error('Failed to fetch blood units');
      }
      
      const data = await response.json();
      setBloodUnits(data);
      setFilteredUnits(data);
    } catch (error) {
      console.error('Error fetching blood units:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blood units. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      toast({
        title: 'Error',
        description: 'Please select a new status.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`/api/inventory/blood-units/${selectedUnit._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNote,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update local state
      const updatedUnits = bloodUnits.map(unit => 
        unit._id === selectedUnit._id 
          ? { ...unit, status: newStatus, statusHistory: [...(unit.statusHistory || []), { status: newStatus, date: new Date(), notes: statusNote }] } 
          : unit
      );
      
      setBloodUnits(updatedUnits);
      
      toast({
        title: 'Success',
        description: `Blood unit status updated to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onUpdateStatusClose();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blood unit status. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUnit = async () => {
    try {
      const response = await fetch(`/api/inventory/blood-units/${selectedUnit._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete blood unit');
      }

      // Update local state
      const updatedUnits = bloodUnits.filter(unit => unit._id !== selectedUnit._id);
      setBloodUnits(updatedUnits);
      
      toast({
        title: 'Success',
        description: 'Blood unit deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onDeleteAlertClose();
    } catch (error) {
      console.error('Error deleting blood unit:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blood unit. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBloodUnitAdded = (newUnit) => {
    setBloodUnits(prevUnits => [...prevUnits, newUnit]);
    onAddModalClose();
    
    toast({
      title: 'Success',
      description: 'Blood unit added successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setBloodTypeFilter('');
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
              onClick={resetFilters}
              colorScheme="gray"
            >
              Reset Filters
            </Button>
          </Stack>
        </CardBody>
      </Card>

      <Card bg={bgColor} boxShadow="md" borderRadius="lg">
        <CardBody p={0}>
          {loading ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : filteredUnits.length === 0 ? (
            <Flex justify="center" align="center" h="200px" direction="column">
              <Text mb={4}>No blood units found matching your criteria.</Text>
              <Button onClick={resetFilters} colorScheme="blue" variant="outline">
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

      {/* Add Blood Unit Modal */}
      <AddBloodUnitModal 
        isOpen={isAddModalOpen} 
        onClose={onAddModalClose} 
        onBloodUnitAdded={handleBloodUnitAdded} 
      />

      {/* Blood Unit Details Modal */}
      {selectedUnit && (
        <Modal isOpen={isDetailModalOpen} onClose={onDetailModalClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Blood Unit Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Tabs isFitted variant="enclosed">
                <TabList mb="1em">
                  <Tab>Basic Info</Tab>
                  <Tab>Processing Details</Tab>
                  <Tab>Status History</Tab>
                  {selectedUnit.transfusionRecord && selectedUnit.transfusionRecord.recipientId && (
                    <Tab>Transfusion</Tab>
                  )}
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
                        <Text fontWeight="bold">Current Status:</Text>
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
                        <Text>{renderExpiryStatus(selectedUnit.expirationDate)}</Text>
                      </Box>
                      <Box gridColumn={{ md: 'span 2' }}>
                        <Text fontWeight="bold">Storage Location:</Text>
                        {selectedUnit.location ? (
                          <Text>
                            {selectedUnit.location.facility}, 
                            {selectedUnit.location.storageUnit}
                            {selectedUnit.location.shelf && `, Shelf ${selectedUnit.location.shelf}`}
                            {selectedUnit.location.position && `, Position ${selectedUnit.location.position}`}
                          </Text>
                        ) : (
                          <Text>No location information available</Text>
                        )}
                      </Box>
                      {selectedUnit.notes && (
                        <Box gridColumn={{ md: 'span 2' }}>
                          <Text fontWeight="bold">Notes:</Text>
                          <Text>{selectedUnit.notes}</Text>
                        </Box>
                      )}
                    </SimpleGrid>
                  </TabPanel>
                  
                  <TabPanel>
                    {selectedUnit.processingDetails ? (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text fontWeight="bold">Process Method:</Text>
                          <Text>{selectedUnit.processingDetails.processMethod || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Processed Date:</Text>
                          <Text>{formatDate(selectedUnit.processingDetails.processedDate)}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Technician ID:</Text>
                          <Text>{selectedUnit.processingDetails.technicianId || 'N/A'}</Text>
                        </Box>
                        <Box gridColumn={{ md: 'span 2' }}>
                          <Text fontWeight="bold">Test Results:</Text>
                          {selectedUnit.processingDetails.testResults ? (
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2} mt={2}>
                              <Box>
                                <HStack>
                                  <Text>HIV:</Text>
                                  {selectedUnit.processingDetails.testResults.hiv !== undefined ? (
                                    <Badge colorScheme={selectedUnit.processingDetails.testResults.hiv ? 'red' : 'green'}>
                                      {selectedUnit.processingDetails.testResults.hiv ? 'Positive' : 'Negative'}
                                    </Badge>
                                  ) : <Text>Not tested</Text>}
                                </HStack>
                              </Box>
                              <Box>
                                <HStack>
                                  <Text>Hepatitis B:</Text>
                                  {selectedUnit.processingDetails.testResults.hepatitisB !== undefined ? (
                                    <Badge colorScheme={selectedUnit.processingDetails.testResults.hepatitisB ? 'red' : 'green'}>
                                      {selectedUnit.processingDetails.testResults.hepatitisB ? 'Positive' : 'Negative'}
                                    </Badge>
                                  ) : <Text>Not tested</Text>}
                                </HStack>
                              </Box>
                              <Box>
                                <HStack>
                                  <Text>Hepatitis C:</Text>
                                  {selectedUnit.processingDetails.testResults.hepatitisC !== undefined ? (
                                    <Badge colorScheme={selectedUnit.processingDetails.testResults.hepatitisC ? 'red' : 'green'}>
                                      {selectedUnit.processingDetails.testResults.hepatitisC ? 'Positive' : 'Negative'}
                                    </Badge>
                                  ) : <Text>Not tested</Text>}
                                </HStack>
                              </Box>
                              <Box>
                                <HStack>
                                  <Text>Syphilis:</Text>
                                  {selectedUnit.processingDetails.testResults.syphilis !== undefined ? (
                                    <Badge colorScheme={selectedUnit.processingDetails.testResults.syphilis ? 'red' : 'green'}>
                                      {selectedUnit.processingDetails.testResults.syphilis ? 'Positive' : 'Negative'}
                                    </Badge>
                                  ) : <Text>Not tested</Text>}
                                </HStack>
                              </Box>
                              <Box>
                                <HStack>
                                  <Text>Malaria:</Text>
                                  {selectedUnit.processingDetails.testResults.malaria !== undefined ? (
                                    <Badge colorScheme={selectedUnit.processingDetails.testResults.malaria ? 'red' : 'green'}>
                                      {selectedUnit.processingDetails.testResults.malaria ? 'Positive' : 'Negative'}
                                    </Badge>
                                  ) : <Text>Not tested</Text>}
                                </HStack>
                              </Box>
                            </SimpleGrid>
                          ) : (
                            <Text>No test results available</Text>
                          )}
                        </Box>
                      </SimpleGrid>
                    ) : (
                      <Text>No processing details available</Text>
                    )}
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
                          {[...selectedUnit.statusHistory].reverse().map((history, index) => (
                            <Tr key={index}>
                              <Td>
                                <Badge colorScheme={statusColorMap[history.status] || 'gray'}>
                                  {history.status}
                                </Badge>
                              </Td>
                              <Td>{formatDate(history.date)}</Td>
                              <Td>{history.updatedBy || 'System'}</Td>
                              <Td>{history.notes || '-'}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Text>No status history available</Text>
                    )}
                  </TabPanel>
                  
                  {selectedUnit.transfusionRecord && selectedUnit.transfusionRecord.recipientId && (
                    <TabPanel>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <Box>
                          <Text fontWeight="bold">Recipient ID:</Text>
                          <Text>{selectedUnit.transfusionRecord.recipientId}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Transfusion Date:</Text>
                          <Text>{formatDate(selectedUnit.transfusionRecord.transfusionDate)}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Hospital:</Text>
                          <Text>{selectedUnit.transfusionRecord.hospital || 'N/A'}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Physician:</Text>
                          <Text>{selectedUnit.transfusionRecord.physician || 'N/A'}</Text>
                        </Box>
                        {selectedUnit.transfusionRecord.notes && (
                          <Box gridColumn={{ md: 'span 2' }}>
                            <Text fontWeight="bold">Notes:</Text>
                            <Text>{selectedUnit.transfusionRecord.notes}</Text>
                          </Box>
                        )}
                      </SimpleGrid>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onDetailModalClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* Update Status Modal */}
      {selectedUnit && (
        <Modal isOpen={isUpdateStatusOpen} onClose={onUpdateStatusClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Update Blood Unit Status</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text mb={4}>
                Current Status: <Badge colorScheme={statusColorMap[selectedUnit.status] || 'gray'}>
                  {selectedUnit.status}
                </Badge>
              </Text>
              
              <FormControl mb={4} isRequired>
                <FormLabel>New Status</FormLabel>
                <Select 
                  placeholder="Select new status" 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {Object.keys(statusColorMap).map(status => (
                    <option key={status} value={status} disabled={status === selectedUnit.status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl mb={4}>
                <FormLabel>Notes</FormLabel>
                <Textarea 
                  placeholder="Add notes about this status change"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onUpdateStatusClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleUpdateStatus}>
                Update Status
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

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
              Are you sure you want to delete blood unit {selectedUnit?.unitId}? 
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
