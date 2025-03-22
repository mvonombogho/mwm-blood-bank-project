import { useState, useEffect, useRef } from 'react';
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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
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
      
      // Add authorization headers if session token is available
      const headers = {};
      if (session?.token) {
        headers['Authorization'] = `Bearer ${session.token}`;
      }
      
      const response = await fetch('/api/inventory/storage', {
        headers,
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