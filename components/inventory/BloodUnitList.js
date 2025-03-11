import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Badge,
  Button,
  Flex,
  Input,
  Select,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Text,
  HStack,
  VStack,
  useToast,
  Spinner,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  DeleteIcon,
  EditIcon,
  SearchIcon,
  AddIcon,
  ViewIcon,
  WarningIcon,
  RepeatIcon,
} from '@chakra-ui/icons';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';

const BloodUnitList = () => {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  
  const ITEMS_PER_PAGE = 10;
  
  useEffect(() => {
    fetchBloodUnits();
  }, [page, statusFilter, bloodTypeFilter]);
  
  const fetchBloodUnits = async () => {
    try {
      setLoading(true);
      let url = `/api/inventory/blood-units?page=${page}&limit=${ITEMS_PER_PAGE}`;
      
      if (statusFilter) url += `&status=${statusFilter}`;
      if (bloodTypeFilter) url += `&bloodType=${bloodTypeFilter}`;
      
      const response = await axios.get(url);
      setBloodUnits(response.data);
      
      // Calculate total pages from headers or response metadata
      // This depends on how your API implements pagination
      setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE) || 1);
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch blood units:", err);
      setError("Failed to load inventory data");
      setLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to first page
  };
  
  const handleBloodTypeChange = (e) => {
    setBloodTypeFilter(e.target.value);
    setPage(1); // Reset to first page
  };
  
  const handleViewDetails = (unit) => {
    setSelectedUnit(unit);
    onOpen();
  };
  
  const handleUpdateStatus = async (unitId, newStatus) => {
    try {
      setIsUpdating(true);
      
      await axios.put(`/api/inventory/blood-units/${unitId}`, {
        status: newStatus,
        statusHistory: {
          status: newStatus,
          date: new Date(),
          notes: `Status updated to ${newStatus}`,
        }
      });
      
      // Refresh the data
      fetchBloodUnits();
      
      toast({
        title: "Status updated",
        description: `Unit has been marked as ${newStatus}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      setIsUpdating(false);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast({
        title: "Error",
        description: "Failed to update status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsUpdating(false);
    }
  };
  
  const filteredUnits = bloodUnits.filter(unit => {
    return (
      (unit.unitId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       unit.bloodType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       unit.location?.facility?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === '' || unit.status === statusFilter) &&
      (bloodTypeFilter === '' || unit.bloodType === bloodTypeFilter)
    );
  });
  
  // Get status badge color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'green';
      case 'Reserved':
        return 'blue';
      case 'Quarantined':
        return 'yellow';
      case 'Discarded':
        return 'red';
      case 'Transfused':
        return 'purple';
      case 'Expired':
        return 'gray';
      default:
        return 'gray';
    }
  };
  
  // Get expiry warning for soon-expiring units
  const getExpiryWarning = (expiryDate) => {
    const daysLeft = differenceInDays(new Date(expiryDate), new Date());
    
    if (daysLeft <= 0) return 'Expired';
    if (daysLeft <= 3) return 'Critical';
    if (daysLeft <= 7) return 'Warning';
    if (daysLeft <= 14) return 'Caution';
    return '';
  };
  
  return (
    <Box p={5}>
      <Heading mb={6}>Blood Units Inventory</Heading>
      
      {/* Search and Filters */}
      <Flex mb={6} direction={{ base: 'column', md: 'row' }} gap={4}>
        <InputGroup maxW={{ base: '100%', md: '300px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search by ID, blood type or location"
            value={searchTerm}
            onChange={handleSearch}
          />
        </InputGroup>
        
        <Select
          placeholder="Filter by status"
          maxW={{ base: '100%', md: '200px' }}
          value={statusFilter}
          onChange={handleStatusChange}
        >
          <option value="">All Statuses</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
          <option value="Quarantined">Quarantined</option>
          <option value="Discarded">Discarded</option>
          <option value="Transfused">Transfused</option>
          <option value="Expired">Expired</option>
        </Select>
        
        <Select
          placeholder="Filter by blood type"
          maxW={{ base: '100%', md: '200px' }}
          value={bloodTypeFilter}
          onChange={handleBloodTypeChange}
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
        
        <Button
          leftIcon={<RepeatIcon />}
          colorScheme="blue"
          onClick={() => {
            setSearchTerm('');
            setStatusFilter('');
            setBloodTypeFilter('');
            fetchBloodUnits();
          }}
          ml="auto"
        >
          Reset
        </Button>
        
        <Button
          leftIcon={<AddIcon />}
          colorScheme="green"
          onClick={() => {
            // Navigate to add blood unit page
            window.location.href = '/inventory/blood-units/new';
          }}
        >
          Add Unit
        </Button>
      </Flex>
      
      {loading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Text color="red.500" fontSize="lg" textAlign="center">
          {error}
        </Text>
      ) : (
        <>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Unit ID</Th>
                  <Th>Blood Type</Th>
                  <Th>Collection Date</Th>
                  <Th>Expiry Date</Th>
                  <Th>Status</Th>
                  <Th>Location</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUnits.map((unit) => {
                  const expiryWarning = getExpiryWarning(unit.expirationDate);
                  const daysLeft = differenceInDays(
                    new Date(unit.expirationDate),
                    new Date()
                  );
                  
                  return (
                    <Tr key={unit._id}>
                      <Td>{unit.unitId}</Td>
                      <Td>
                        <Badge colorScheme={
                          unit.bloodType.includes('A') ? 'red' :
                          unit.bloodType.includes('B') ? 'blue' :
                          unit.bloodType.includes('AB') ? 'purple' : 'green'
                        }>
                          {unit.bloodType}
                        </Badge>
                      </Td>
                      <Td>{format(new Date(unit.collectionDate), 'dd MMM yyyy')}</Td>
                      <Td>
                        <Flex align="center">
                          {expiryWarning && (
                            <Tooltip label={`${daysLeft} days left`}>
                              <WarningIcon
                                color={
                                  expiryWarning === 'Expired' || expiryWarning === 'Critical' ? 'red.500' :
                                  expiryWarning === 'Warning' ? 'orange.500' : 'yellow.500'
                                }
                                mr={2}
                              />
                            </Tooltip>
                          )}
                          {format(new Date(unit.expirationDate), 'dd MMM yyyy')}
                        </Flex>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(unit.status)}>
                          {unit.status}
                        </Badge>
                      </Td>
                      <Td>{`${unit.location.facility} - ${unit.location.storageUnit}`}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="View details"
                            icon={<ViewIcon />}
                            size="sm"
                            onClick={() => handleViewDetails(unit)}
                          />
                          
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              aria-label="Change status"
                              icon={<ChevronDownIcon />}
                              size="sm"
                              variant="outline"
                              isLoading={isUpdating}
                            />
                            <MenuList>
                              <MenuItem onClick={() => handleUpdateStatus(unit._id, 'Available')}>
                                Mark as Available
                              </MenuItem>
                              <MenuItem onClick={() => handleUpdateStatus(unit._id, 'Reserved')}>
                                Mark as Reserved
                              </MenuItem>
                              <MenuItem onClick={() => handleUpdateStatus(unit._id, 'Quarantined')}>
                                Mark as Quarantined
                              </MenuItem>
                              <MenuItem onClick={() => handleUpdateStatus(unit._id, 'Discarded')}>
                                Mark as Discarded
                              </MenuItem>
                              <MenuItem onClick={() => handleUpdateStatus(unit._id, 'Transfused')}>
                                Mark as Transfused
                              </MenuItem>
                              <MenuItem onClick={() => handleUpdateStatus(unit._id, 'Expired')}>
                                Mark as Expired
                              </MenuItem>
                            </MenuList>
                          </Menu>
                          
                          <IconButton
                            aria-label="Edit"
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => {
                              window.location.href = `/inventory/blood-units/edit/${unit._id}`;
                            }}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <Flex justifyContent="space-between" mt={6}>
            <Text>
              Showing {filteredUnits.length} of {bloodUnits.length} units
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                isDisabled={page === 1}
              >
                Previous
              </Button>
              <Text>
                Page {page} of {totalPages}
              </Text>
              <Button
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                isDisabled={page === totalPages}
              >
                Next
              </Button>
            </HStack>
          </Flex>
        </>
      )}
      
      {/* Detail modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Blood Unit Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUnit && (
              <VStack align="stretch" spacing={4}>
                <Flex justify="space-between">
                  <Box>
                    <Text fontWeight="bold">Unit ID:</Text>
                    <Text>{selectedUnit.unitId}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Blood Type:</Text>
                    <Badge colorScheme={
                      selectedUnit.bloodType.includes('A') ? 'red' :
                      selectedUnit.bloodType.includes('B') ? 'blue' :
                      selectedUnit.bloodType.includes('AB') ? 'purple' : 'green'
                    } size="lg">
                      {selectedUnit.bloodType}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Status:</Text>
                    <Badge colorScheme={getStatusColor(selectedUnit.status)} size="lg">
                      {selectedUnit.status}
                    </Badge>
                  </Box>
                </Flex>
                
                <Box>
                  <Text fontWeight="bold">Collection & Expiry:</Text>
                  <Flex justify="space-between">
                    <Text>Collected: {format(new Date(selectedUnit.collectionDate), 'dd MMM yyyy')}</Text>
                    <Text>Expires: {format(new Date(selectedUnit.expirationDate), 'dd MMM yyyy')}</Text>
                    <Text>
                      {differenceInDays(new Date(selectedUnit.expirationDate), new Date())} days remaining
                    </Text>
                  </Flex>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Storage Location:</Text>
                  <Text>
                    Facility: {selectedUnit.location.facility}<br />
                    Storage Unit: {selectedUnit.location.storageUnit}<br />
                    {selectedUnit.location.shelf && `Shelf: ${selectedUnit.location.shelf}`}<br />
                    {selectedUnit.location.position && `Position: ${selectedUnit.location.position}`}
                  </Text>
                </Box>
                
                <Box>
                  <Text fontWeight="bold">Processing Details:</Text>
                  <Text>
                    {selectedUnit.processingDetails.processMethod || 'Not processed'}<br />
                    {selectedUnit.processingDetails.technicianId && 
                      `Technician: ${selectedUnit.processingDetails.technicianId}`}<br />
                    {selectedUnit.processingDetails.processedDate && 
                      `Processed on: ${format(new Date(selectedUnit.processingDetails.processedDate), 'dd MMM yyyy')}`}
                  </Text>
                </Box>
                
                {selectedUnit.transfusionRecord && selectedUnit.transfusionRecord.recipientId && (
                  <Box>
                    <Text fontWeight="bold">Transfusion Record:</Text>
                    <Text>
                      Recipient ID: {selectedUnit.transfusionRecord.recipientId}<br />
                      Hospital: {selectedUnit.transfusionRecord.hospital || 'Not specified'}<br />
                      Physician: {selectedUnit.transfusionRecord.physician || 'Not specified'}<br />
                      Date: {selectedUnit.transfusionRecord.transfusionDate && 
                        format(new Date(selectedUnit.transfusionRecord.transfusionDate), 'dd MMM yyyy')}
                    </Text>
                  </Box>
                )}
                
                {selectedUnit.notes && (
                  <Box>
                    <Text fontWeight="bold">Notes:</Text>
                    <Text>{selectedUnit.notes}</Text>
                  </Box>
                )}
                
                <Box>
                  <Text fontWeight="bold">Status History:</Text>
                  <TableContainer>
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
                        {selectedUnit.statusHistory && selectedUnit.statusHistory.map((history, index) => (
                          <Tr key={index}>
                            <Td>
                              <Badge colorScheme={getStatusColor(history.status)}>
                                {history.status}
                              </Badge>
                            </Td>
                            <Td>{format(new Date(history.date), 'dd MMM yyyy HH:mm')}</Td>
                            <Td>{history.updatedBy || 'System'}</Td>
                            <Td>{history.notes || '-'}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                onClose();
                window.location.href = `/inventory/blood-units/edit/${selectedUnit._id}`;
              }}
            >
              Edit Details
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BloodUnitList;