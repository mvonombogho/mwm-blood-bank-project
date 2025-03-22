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