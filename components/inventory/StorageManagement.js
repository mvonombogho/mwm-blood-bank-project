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