import { useState, useEffect, useCallback, useRef } from 'react';
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
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useBreakpointValue,
  FormControl,
  FormLabel,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Checkbox
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
  FiSettings,
  FiMoreVertical,
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiSave,
  FiClock,
  FiLock,
  FiBell
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
  const { isOpen: isDeleteDialogOpen, onOpen: onOpenDeleteDialog, onClose: onCloseDeleteDialog } = useDisclosure();
  const cancelDeleteRef = useRef();
  
  const [storageUnits, setStorageUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissionError, setPermissionError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [storageToDelete, setStorageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUnits, setTotalUnits] = useState(0);
  
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const { data: session, status: sessionStatus } = useSession();

  const fetchStorageUnits = useCallback(async (page = 1, limit = itemsPerPage) => {
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
      
      // Build query params for pagination and filtering
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter })
      });
      
      const response = await fetch(`/api/inventory/storage?${queryParams.toString()}`, {
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
      
      // Check if the response has pagination info
      if (data.units && Array.isArray(data.units)) {
        setStorageUnits(data.units);
        setFilteredUnits(data.units);
        setTotalUnits(data.totalCount || data.units.length);
        setTotalPages(data.totalPages || Math.ceil(data.units.length / itemsPerPage));
        setCurrentPage(data.currentPage || page);
      } else if (Array.isArray(data)) {
        // Fallback for API that doesn't support pagination yet
        setStorageUnits(data);
        setFilteredUnits(data);
        setTotalUnits(data.length);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } else {
        console.warn('Unexpected data format:', data);
        setStorageUnits([]);
        setFilteredUnits([]);
        setTotalUnits(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching storage units:', err);
      setError('Failed to load storage units. Please try again.');
      setStorageUnits([]);
      setFilteredUnits([]);
    } finally {
      setLoading(false);
    }
  }, [sessionStatus, searchTerm, statusFilter, typeFilter, itemsPerPage]);

  useEffect(() => {
    fetchStorageUnits(currentPage);
  }, [fetchStorageUnits, currentPage]);

  useEffect(() => {
    if (searchTerm !== '' || statusFilter !== '' || typeFilter !== '') {
      // Reset to first page when filters change
      setCurrentPage(1);
      fetchStorageUnits(1);
    }
  }, [searchTerm, statusFilter, typeFilter, fetchStorageUnits]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
    
    // Refresh to show the new unit
    fetchStorageUnits(currentPage);
  };

  const handleDeleteStorageUnit = (unit) => {
    setStorageToDelete(unit);
    onOpenDeleteDialog();
  };
  
  const confirmDeleteStorageUnit = async () => {
    if (!storageToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/inventory/storage/${storageToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.status === 401) {
        toast({
          title: 'Authentication Error',
          description: 'Please sign in again to continue.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      if (response.status === 403) {
        toast({
          title: 'Permission Denied',
          description: 'You do not have permission to delete storage units.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete storage unit');
      }
      
      // If successful
      toast({
        title: 'Storage Unit Deleted',
        description: `${storageToDelete.name} has been deleted successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset selected storage if it was the deleted one
      if (selectedStorage?._id === storageToDelete._id) {
        setSelectedStorage(null);
      }
      
      // Refresh the list
      fetchStorageUnits(currentPage);
    } catch (err) {
      console.error('Error deleting storage unit:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete storage unit. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      onCloseDeleteDialog();
      setStorageToDelete(null);
    }
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
    fetchStorageUnits(currentPage);
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

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page
    fetchStorageUnits(1, newItemsPerPage);
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

  // Main component UI
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
              onClick={() => fetchStorageUnits(currentPage)}
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
          <Button colorScheme="red" size="sm" onClick={() => fetchStorageUnits(currentPage)}>
            Try Again
          </Button>
        </Alert>
      )}
      
      {/* The rest of the UI will be added in subsequent updates */}
      
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onCloseDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Storage Unit
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <strong>{storageToDelete?.name}</strong>?
              <Text color="red.500" mt={2}>
                This action cannot be undone. All associated temperature readings will also be deleted.
              </Text>
              {storageToDelete?.capacity?.used > 0 && (
                <Alert status="warning" mt={3}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      This storage unit has {storageToDelete.capacity.used} blood units stored in it. 
                      Please relocate or dispose of these units before deleting.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={onCloseDeleteDialog}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={confirmDeleteStorageUnit} 
                ml={3}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default StorageManagement;