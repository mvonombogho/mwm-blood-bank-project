import { Box, Heading, Stack, Flex, Text, Badge, Button, useColorModeValue, Spinner, Divider, HStack, Icon } from '@chakra-ui/react';
import { FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaCalendarDay } from 'react-icons/fa';

const ExpiryActionCards = ({ expiryData, isLoading }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const ExpiryCard = ({ title, units, colorScheme, icon, actionText }) => (
    <Box 
      bg={cardBg} 
      borderRadius="lg" 
      shadow="md" 
      borderWidth="1px" 
      borderColor={borderColor}
      borderLeftWidth="4px"
      borderLeftColor={`${colorScheme}.500`}
      overflow="hidden"
    >
      <Box p={4}>
        <HStack mb={3}>
          <Icon as={icon} color={`${colorScheme}.500`} boxSize={5} />
          <Heading as="h4" size="md">
            {title}
          </Heading>
        </HStack>
        
        {units.length > 0 ? (
          <Stack spacing={2} mb={4} maxH="150px" overflowY="auto" pr={2}>
            {units.map((unit, index) => (
              <Flex key={index} justify="space-between" align="center" p={2} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
                <HStack>
                  <Badge colorScheme="red">{unit.bloodType}</Badge>
                  <Text fontWeight="medium">{unit.id}</Text>
                </HStack>
                <Text fontSize="sm">{unit.daysRemaining} days left</Text>
              </Flex>
            ))}
          </Stack>
        ) : (
          <Text color="gray.500" mb={4}>No units in this category</Text>
        )}
        
        <Button colorScheme={colorScheme} size="sm" isDisabled={units.length === 0} width="full">
          {actionText}
        </Button>
      </Box>
    </Box>
  );
  
  return (
    <Box>
      <Heading as="h3" size="md" mb={4}>Expiry Actions</Heading>
      
      {isLoading ? (
        <Flex justify="center" align="center" py={8}>
          <Spinner size="lg" thickness="3px" color="red.500" />
        </Flex>
      ) : (
        <Stack spacing={4}>
          <ExpiryCard 
            title="Critical (1-3 days)"
            units={expiryData.critical}
            colorScheme="red"
            icon={FaExclamationCircle}
            actionText="Prioritize For Use"
          />
          
          <ExpiryCard 
            title="Warning (4-7 days)"
            units={expiryData.warning}
            colorScheme="orange"
            icon={FaExclamationTriangle}
            actionText="Schedule For Use"
          />
          
          <ExpiryCard 
            title="Caution (8-14 days)"
            units={expiryData.caution}
            colorScheme="yellow"
            icon={FaInfoCircle}
            actionText="Plan For Use"
          />
        </Stack>
      )}
    </Box>
  );
};

export default ExpiryActionCards;
