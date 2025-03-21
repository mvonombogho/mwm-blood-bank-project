import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Badge,
  useToast,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  CardHeader,
  CardBody,
  Select,
  HStack,
  VStack,
  useColorModeValue,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  SimpleGrid,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiFilter, FiAlertCircle, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid Date';
  }
};

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ExpiryCalendar = () => {
  const today = new Date();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [expiryData, setExpiryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayUnits, setSelectedDayUnits] = useState([]);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [error, setError] = useState(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const calendarBgColor = useColorModeValue('gray.50', 'gray.700');
  const todayBgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const todayBorderColor = useColorModeValue('blue.500', 'blue.300');
  const expiryCriticalColor = useColorModeValue('red.50', 'red.900');
  const expiryWarningColor = useColorModeValue('orange.50', 'orange.900');
  const expiryGoodColor = useColorModeValue('green.50', 'green.900');

  useEffect(() => {
    fetchExpiryData();
  }, [year, month, bloodTypeFilter]);

  const fetchExpiryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate first and last day of the month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Format dates for API call
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      // Build API URL with query parameters
      let url = `/api/inventory/expiry-tracking?startDate=${startDate}&endDate=${endDate}`;
      
      if (bloodTypeFilter) {
        url += `&bloodType=${bloodTypeFilter}`;
      }
      
      // Make API request
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Organize data by day
      if (data.expiringUnits && Array.isArray(data.expiringUnits)) {
        const organizedData = {};
        
        data.expiringUnits.forEach(unit => {
          if (unit.expirationDate) {
            const expiryDate = new Date(unit.expirationDate);
            
            // Check if expiry date is in the current month/year
            if (expiryDate.getMonth() === month && expiryDate.getFullYear() === year) {
              const day = expiryDate.getDate();
              
              if (!organizedData[day]) {
                organizedData[day] = [];
              }
              
              organizedData[day].push(unit);
            }
          }
        });
        
        setExpiryData(organizedData);
      } else if (data.calendarData && Array.isArray(data.calendarData)) {
        // Alternative data format - calendar data might just have counts
        const organizedData = {};
        
        data.calendarData.forEach(item => {
          if (item.date) {
            const date = new Date(item.date);
            if (date.getMonth() === month && date.getFullYear() === year) {
              const day = date.getDate();
              // Store count instead of array of units
              organizedData[day] = item.count || 0;
            }
          }
        });
        
        setExpiryData(organizedData);
      } else {
        // No valid data format found
        setExpiryData({});
      }
    } catch (error) {
      console.error('Error fetching expiry data:', error);
      setError(error.message || 'Failed to load expiry data');
      toast({
        title: 'Error',
        description: 'Failed to load expiry data. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayClick = async (day) => {
    if (!day || !(expiryData[day] && (expiryData[day].length > 0 || (typeof expiryData[day] === 'number' && expiryData[day] > 0)))) {
      return;
    }
    
    setSelectedDay(day);
    setLoading(true);
    setSelectedDayUnits([]);
    
    try {
      // Format the specific date for the API request
      const selectedDate = new Date(year, month, day);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Build API URL for this specific day
      let url = `/api/inventory/expiry-tracking?date=${formattedDate}`;
      
      if (bloodTypeFilter) {
        url += `&bloodType=${bloodTypeFilter}`;
      }
      
      // Make API request for specific day data
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Set the day's units
      if (data.expiringUnits && Array.isArray(data.expiringUnits)) {
        setSelectedDayUnits(data.expiringUnits);
      } else {
        setSelectedDayUnits([]);
      }
    } catch (error) {
      console.error('Error fetching day details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load details for this day.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      onOpen(); // Open the modal with day details
    }
  };
  
  // Calculate expiry urgency for a date
  const calculateUrgency = (expirationDate) => {
    if (!expirationDate) return { urgent: 0, warning: 0, normal: 0 };
    
    try {
      const expiry = new Date(expirationDate);
      const currentDate = new Date();
      const diffTime = expiry - currentDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 2) return 'urgent';
      if (diffDays <= 7) return 'warning';
      return 'normal';
    } catch (e) {
      return 'normal';
    }
  };