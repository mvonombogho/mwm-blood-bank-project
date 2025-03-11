import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Stack, Badge, Flex, Button, HStack,
  useColorModeValue, Icon, Divider, Alert, AlertIcon,
  AlertTitle, AlertDescription, CloseButton, Spinner
} from '@chakra-ui/react';
import { 
  FaExclamationTriangle, FaExclamationCircle, FaInfoCircle,
  FaTint, FaThermometerHalf, FaCalendarTimes, FaBellSlash
} from 'react-icons/fa';

const InventoryAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // This would be replaced with an actual API call
  useEffect(() => {
    // Simulating API call delay
    const timer = setTimeout(() => {
      setAlerts([
        {
          id: 'IA001',
          type: 'critical',
          category: 'inventory',
          title: 'Critical Blood Level',
          message: 'Blood type O- is below critical threshold (10 units)',
          date: '2025-03-11'
        },
        {
          id: 'IA002',
          type: 'warning',
          category: 'inventory',
          title: 'Low Blood Level',
          message: 'Blood type AB- is below minimum threshold (15 units)',
          date: '2025-03-11'
        },
        {
          id: 'IA003',
          type: 'warning',
          category: 'expiry',
          title: 'Expiring Units',
          message: '5 units of A+ blood will expire within 48 hours',
          date: '2025-03-11'
        },
        {
          id: 'IA004',
          type: 'warning',
          category: 'storage',
          title: 'Temperature Fluctuation',
          message: 'Platelet Incubator temperature outside optimal range',
          date: '2025-03-11'
        },
        {
          id: 'IA005',
          type: 'info',
          category: 'inventory',
          title: 'Scheduled Delivery',
          message: 'Blood delivery scheduled for tomorrow at 9:00 AM',
          date: '2025-03-11'
        }
      ]);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleDismiss = (alertId) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };
  
  const getAlertIcon = (category) => {
    switch (category) {
      case 'inventory': return FaTint;
      case 'expiry': return FaCalendarTimes;
      case 'storage': return FaThermometerHalf;
      default: return FaInfoCircle;
    }
  };
  
  const getAlertStatus = (type) => {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };
  
  const criticalAlerts = alerts.filter(alert => alert.type === 'critical');
  const warningAlerts = alerts.filter(alert => alert.type === 'warning');
  const infoAlerts = alerts.filter(alert => alert.type === 'info');
  
  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        Inventory Alerts & Notifications
      </Heading>
      
      {isLoading ? (
        <Flex justify="center" align="center" py={8}>
          <Spinner size="xl" thickness="4px" color="red.500" />
        </Flex>
      ) : alerts.length === 0 ? (
        <Flex 
          direction="column" 
          align="center" 
          justify="center" 
          py={8} 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          borderStyle="dashed"
        >
          <Icon as={FaBellSlash} boxSize={12} color="gray.400" mb={3} />
          <Text color="gray.500" fontSize="lg">
            No alerts or notifications
          </Text>
          <Text color="gray.400">
            All inventory systems operating normally
          </Text>
        </Flex>
      ) : (
        <Stack spacing={4}>
          {criticalAlerts.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold" fontSize="md" mb={2} color="red.500">
                Critical Alerts ({criticalAlerts.length})
              </Text>
              <Stack spacing={3}>
                {criticalAlerts.map((alert) => (
                  <Alert key={alert.id} status="error" borderRadius="md" variant="solid">
                    <AlertIcon />
                    <Box flex="1">
                      <AlertTitle>{alert.title}</AlertTitle>
                      <AlertDescription display="block">
                        {alert.message}
                      </AlertDescription>
                    </Box>
                    <CloseButton 
                      position="absolute" 
                      right={2} 
                      top={2} 
                      onClick={() => handleDismiss(alert.id)}
                    />
                  </Alert>
                ))}
              </Stack>
            </Box>
          )}
          
          {warningAlerts.length > 0 && (
            <Box mb={4}>
              <Text fontWeight="bold" fontSize="md" mb={2} color="orange.500">
                Warnings ({warningAlerts.length})
              </Text>
              <Stack spacing={3}>
                {warningAlerts.map((alert) => (
                  <Alert key={alert.id} status="warning" borderRadius="md">
                    <AlertIcon />
                    <Flex flex="1" justifyContent="space-between" alignItems="center">
                      <Box>
                        <HStack mb={1}>
                          <AlertTitle>{alert.title}</AlertTitle>
                          <Badge colorScheme="orange">{alert.category}</Badge>
                        </HStack>
                        <AlertDescription display="block">
                          {alert.message}
                        </AlertDescription>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mr={8}>{alert.date}</Text>
                      </Box>
                    </Flex>
                    <CloseButton 
                      position="absolute" 
                      right={2} 
                      top={2} 
                      onClick={() => handleDismiss(alert.id)}
                    />
                  </Alert>
                ))}
              </Stack>
            </Box>
          )}
          
          {infoAlerts.length > 0 && (
            <Box>
              <Text fontWeight="bold" fontSize="md" mb={2} color="blue.500">
                Information ({infoAlerts.length})
              </Text>
              <Stack spacing={3}>
                {infoAlerts.map((alert) => (
                  <Alert key={alert.id} status="info" borderRadius="md">
                    <AlertIcon />
                    <Flex flex="1" justifyContent="space-between" alignItems="center">
                      <Box>
                        <HStack mb={1}>
                          <AlertTitle>{alert.title}</AlertTitle>
                          <Badge colorScheme="blue">{alert.category}</Badge>
                        </HStack>
                        <AlertDescription display="block">
                          {alert.message}
                        </AlertDescription>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mr={8}>{alert.date}</Text>
                      </Box>
                    </Flex>
                    <CloseButton 
                      position="absolute" 
                      right={2} 
                      top={2} 
                      onClick={() => handleDismiss(alert.id)}
                    />
                  </Alert>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default InventoryAlerts;
