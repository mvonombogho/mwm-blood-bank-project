import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Text,
  Alert,
  AlertIcon,
  useToast,
  useDisclosure,
  Skeleton
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ChevronDownIcon, ViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import axios from 'axios';

const BloodUnitList = () => {
  const toast = useToast();
  const router = useRouter();
  const [bloodUnits, setBloodUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  
  // Form and confirmation dialogs
  const cancelRef = useRef();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [unitToDelete, setUnitToDelete] = useState(null);
  
  // Fetch blood units
  const fetchBloodUnits = async (page = 1) => {
    try {
      setLoading(true);
      
      let url = `/api/inventory/blood-units?page=${page}&limit=${pagination.limit}`;
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (bloodTypeFilter) {
        url += `&bloodType=${encodeURIComponent(bloodTypeFilter)}`;
      }
      
      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }
      
      const response = await axios.get(url);
      
      setBloodUnits(response.data.bloodUnits);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load blood units',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Initialize
  useEffect(() => {
    fetchBloodUnits(pagination.page);
  }, []);
  
  // Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBloodUnits(1); // Reset to first page when searching
  };
  
  const handleBloodTypeChange = (e) => {
    setBloodTypeFilter(e.target.value);
    fetchBloodUnits(1); // Reset to first page when filter changes
  };
  
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    fetchBloodUnits(1); // Reset to first page when filter changes
  };
  
  const handlePageChange = (newPage) => {
    fetchBloodUnits(newPage);
  };
  
  const handleViewBloodUnit = (unitId) => {
    router.push(`/inventory/blood-units/${unitId}`);
  };
  
  const handleAddBloodUnit = () => {
    router.push(`/inventory/blood-units/add`);
  };
  
  const handleEditBloodUnit = (unitId) => {
    router.push(`/inventory/blood-units/${unitId}/edit`);
  };
  
  const handleDeleteConfirm = (unit) => {
    setUnitToDelete(unit);
    onDeleteOpen();
  };
  
  const handleDeleteBloodUnit = async () => {
    if (!unitToDelete) return;
    
    try {
      setLoading(true);
      await axios.delete(`/api/inventory/blood-units/${unitToDelete._id}`);
      
      toast({
        title: 'Blood unit deleted',
        description: `Unit ${unitToDelete.unitId} has been deleted`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh blood unit list
      fetchBloodUnits(pagination.page);
      onDeleteClose();
      setUnitToDelete(null);
    } catch (error) {
      toast({
        title: 'Error deleting blood unit',
        description: error.response?.data?.message || 'Could not delete blood unit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'green';
      case 'Reserved': return 'blue';
      case 'Quarantined': return 'yellow';
      case 'Discarded': return 'gray';
      case 'Transfused': return 'purple';
      case 'Expired': return 'red';
      default: return 'gray';
    }
  };
  
  return (
    <Box>
      <Flex direction={{ base: 'column', md: 'row' }} mb={5} gap={3} justify="space-between">
        <Box flex="1">
          <form onSubmit={handleSearch}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by ID or location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </form>
        </Box>
        
        <Stack direction={{ base: 'column', sm: 'row' }} spacing={3}>
          <Select
            placeholder="All Blood Types"
            value={bloodTypeFilter}
            onChange={handleBloodTypeChange}
            width={{ base: 'full', md: '150px' }}
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
          
          <Select
            placeholder="All Status"
            value={statusFilter}
            onChange={handleStatusChange}
            width={{ base: 'full', md: '150px' }}
          >
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Quarantined">Quarantined</option>
            <option value="Transfused">Transfused</option>
            <option value="Discarded">Discarded</option>
            <option value="Expired">Expired</option>
          </Select>
          
          <Button colorScheme="blue" onClick={handleAddBloodUnit} leftIcon={<AddIcon />}>
            Add Unit
          </Button>
        </Stack>
      </Flex>

      {bloodUnits.length > 0 ? (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Unit ID</Th>
                <Th>Blood Type</Th>
                <Th>Status</Th>
                <Th>Collection Date</Th>
                <Th>Expiration Date</Th>
                <Th>Location</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bloodUnits.map((unit) => (
                <Tr key={unit._id}>
                  <Td>{unit.unitId}</Td>
                  <Td>
                    <Badge colorScheme="red" py={1} px={2}>
                      {unit.bloodType}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(unit.status)} py={1} px={2}>
                      {unit.status}
                    </Badge>
                  </Td>
                  <Td>{new Date(unit.collectionDate).toLocaleDateString()}</Td>
                  <Td>
                    <Text
                      color={
                        unit.status !== 'Expired' && 
                        unit.status !== 'Discarded' && 
                        unit.status !== 'Transfused' && 
                        new Date(unit.expirationDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                          ? 'red.500' 
                          : 'inherit'
                      }
                      fontWeight={
                        unit.status !== 'Expired' && 
                        unit.status !== 'Discarded' && 
                        unit.status !== 'Transfused' && 
                        new Date(unit.expirationDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                          ? 'bold' 
                          : 'normal'
                      }
                    >
                      {new Date(unit.expirationDate).toLocaleDateString()}
                    </Text>
                  </Td>
                  <Td>{unit.location?.facility} - {unit.location?.storageUnit}</Td>
                  <Td>
                    <IconButton
                      icon={<ViewIcon />}
                      aria-label="View blood unit"
                      size="sm"
                      mr={2}
                      onClick={() => handleViewBloodUnit(unit._id)}
                    />
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit blood unit"
                      size="sm"
                      mr={2}
                      onClick={() => handleEditBloodUnit(unit._id)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete blood unit"
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteConfirm(unit)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          {/* Pagination */}
          <Flex justify="space-between" align="center" mt={4}>
            <Text color="gray.600">
              Showing {bloodUnits.length} of {pagination.total} units
            </Text>
            <Stack direction="row" spacing={2}>
              <Button
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                isDisabled={pagination.page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                isDisabled={pagination.page >= pagination.pages || loading}
              >
                Next
              </Button>
            </Stack>
          </Flex>
        </Box>
      ) : (
        <Alert status="info">
          <AlertIcon />
          {loading ? 'Loading blood units...' : 'No blood units found matching your criteria'}
        </Alert>
      )}
      
      {/* Delete Confirmation */}
      {unitToDelete && (
        <AlertDialog
          isOpen={isDeleteOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteClose}
        >
          <AlertDialog.Content>
            <AlertDialog.Header fontSize="lg" fontWeight="bold">
              Delete Blood Unit
            </AlertDialog.Header>
            <AlertDialog.Body>
              Are you sure you want to delete blood unit {unitToDelete.unitId}? This action cannot be undone.
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteBloodUnit} ml={3}>
                Delete
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      )}
    </Box>
  );
};

export default BloodUnitList;
