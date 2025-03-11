import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Stack, Badge, Flex, Button,
  useColorModeValue, Icon, Divider, Spinner
} from '@chakra-ui/react';
import { 
  FaExclamationTriangle, FaThermometerHalf, FaDoorOpen,
  FaBolt, FaTools, FaBell, FaCheckCircle
} from 'react-icons/fa';

const StorageAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Generate mock data
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAlerts([
        {
          id: 'ALT001',
          unit: 'Platelet Incubator',
          type: 'Temperature',
          message: 'Temperature above normal range',
          time: '2025-03-11 09:57 AM',
          severity: 'Warning',
          value: '22.3°C',
          threshold: '22.0°C ±0.2°C'
        },
        {
          id: 'ALT002',
          unit: 'Main Refrigerator 1',
          type: 'Door',
          message: 'Door left open',
          time: '2025-03-10 03:22 PM',
          severity: 'Resolved',
          duration: '2m 15s'
        },
        {
          id: 'ALT003',
          unit: 'Plasma Freezer 1',
          type: 'Power',
          message: 'Power fluctuation detected',
          time: '2025-03-09 11:05 PM',
          severity: 'Resolved',
          duration: '30s'
        },
        {
          id: 'ALT004',
          unit: 'RBC Storage Unit 1',
          type: 'Maintenance',
          message: 'Scheduled maintenance due',
          time: '2025-03-11 08:30 AM',
          severity: 'Info',
          scheduledDate: '2025-03-14'
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const getAlertIcon = (type) => {
    switch (type) {
      case 'Temperature': return FaThermometerHalf;
      case 'Door': return FaDoorOpen;
      case 'Power': return FaBolt;
      case 'Maintenance': return FaTools;
      default: return FaBell;
    }
  };
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'red';
      case 'Warning': return 'orange';
      case 'Info': return 'blue';
      case 'Resolved': return 'green';
      default: return 'gray';
    }
  };
  
  return (
    <Box bg={cardBg} p={4} borderRadius="lg" shadow="md" borderWidth="1px" borderColor={borderColor} height="100%">
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h3" size="md">
          Storage Alerts
        </Heading>
        
        {alerts.filter(a => a.severity !== 'Resolved').length > 0 && (
          <Badge colorScheme="red" fontSize="sm" borderRadius="full" px={2}>
            {alerts.filter(a => a.severity !== 'Resolved').length} Active
          </Badge>
        )}
      </Flex>
      
      {isLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="lg" thickness="3px" color="blue.500" />
        </Flex>
      ) : (
        <Stack spacing={3} maxH="300px" overflowY="auto" pr={1}>
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <Box key={alert.id} p={3} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                <Flex justify="space-between" align="center" mb={1}>
                  <HStack>
                    <Icon 
                      as={getAlertIcon(alert.type)} 
                      color={`${getSeverityColor(alert.severity)}.500`} 
                      boxSize={5} 
                    />
                    <Text fontWeight="medium">
                      {alert.unit}
                    </Text>
                  </HStack>
                  <Badge colorScheme={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </Flex>
                
                <Text fontSize="sm" mb={1}>
                  {alert.message}
                </Text>
                
                <Flex justify="space-between" fontSize="xs" color="gray.500">
                  <Text>{alert.time}</Text>
                  {alert.severity === 'Resolved' ? (
                    <Flex align="center">
                      <Icon as={FaCheckCircle} color="green.500" mr={1} />
                      <Text>Resolved</Text>
                    </Flex>
                  ) : (
                    <Button size="xs" colorScheme="blue" variant="outline">
                      Action
                    </Button>
                  )}
                </Flex>
              </Box>
            ))
          ) : (
            <Flex 
              justify="center" 
              align="center" 
              height="200px" 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor={borderColor}
              borderStyle="dashed"
            >
              <Text color="gray.500">No alerts to display</Text>
            </Flex>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default StorageAlerts;
