import { useState, useEffect } from 'react';
import { Box, Heading, SimpleGrid, Text, Alert, AlertIcon, AlertDescription, HStack, Badge, useColorModeValue } from '@chakra-ui/react';
import Layout from '../../components/Layout';
import ExpiryCalendarView from '../../components/inventory/ExpiryCalendarView';
import ExpiryActionCards from '../../components/inventory/ExpiryActionCards';

export default function ExpiryTrackingPage() {
  const [expiryData, setExpiryData] = useState({
    critical: [], // Expiring in 1-3 days
    warning: [],  // Expiring in 4-7 days
    caution: []   // Expiring in 8-14 days
  });
  const [isLoading, setIsLoading] = useState(true);

  // Mock data loading - would be replaced with actual API fetch
  useEffect(() => {
    // Simulating API fetch delay
    const timer = setTimeout(() => {
      setExpiryData({
        critical: [
          { id: 'BU001', bloodType: 'O-', expiryDate: '2025-03-14', daysRemaining: 3 },
          { id: 'BU002', bloodType: 'AB+', expiryDate: '2025-03-13', daysRemaining: 2 }
        ],
        warning: [
          { id: 'BU003', bloodType: 'A+', expiryDate: '2025-03-17', daysRemaining: 6 },
          { id: 'BU004', bloodType: 'B-', expiryDate: '2025-03-16', daysRemaining: 5 },
          { id: 'BU005', bloodType: 'O+', expiryDate: '2025-03-18', daysRemaining: 7 }
        ],
        caution: [
          { id: 'BU006', bloodType: 'A-', expiryDate: '2025-03-22', daysRemaining: 11 },
          { id: 'BU007', bloodType: 'AB-', expiryDate: '2025-03-20', daysRemaining: 9 },
          { id: 'BU008', bloodType: 'B+', expiryDate: '2025-03-25', daysRemaining: 14 }
        ]
      });
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const allExpiringUnits = [...expiryData.critical, ...expiryData.warning, ...expiryData.caution];
  
  return (
    <Layout title="Expiry Tracking">
      <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
        <Heading as="h1" size="xl" mb={6}>
          Blood Units Expiry Tracking
        </Heading>
        
        {expiryData.critical.length > 0 && (
          <Alert status="error" mb={6} borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              <strong>{expiryData.critical.length} units</strong> are expiring in less than 3 days and require immediate attention!
            </AlertDescription>
          </Alert>
        )}
        
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={10}>
          <Box>
            <ExpiryActionCards expiryData={expiryData} isLoading={isLoading} />
          </Box>
          <Box>
            <ExpiryCalendarView expiringUnits={allExpiringUnits} isLoading={isLoading} />
          </Box>
        </SimpleGrid>
        
        <Box>
          <Heading as="h2" size="md" mb={4}>
            Expiry Summary
          </Heading>
          <HStack spacing={4} mb={6}>
            <Badge colorScheme="red" px={3} py={2} borderRadius="md">
              Critical: {expiryData.critical.length}
            </Badge>
            <Badge colorScheme="orange" px={3} py={2} borderRadius="md">
              Warning: {expiryData.warning.length}
            </Badge>
            <Badge colorScheme="yellow" px={3} py={2} borderRadius="md">
              Caution: {expiryData.caution.length}
            </Badge>
          </HStack>
          <Text>Total units expiring within 14 days: {allExpiringUnits.length}</Text>
        </Box>
      </Box>
    </Layout>
  );
}
