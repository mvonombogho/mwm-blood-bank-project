import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, SimpleGrid, Badge, Flex,
  useColorModeValue, Spinner, HStack, IconButton,
  Tooltip
} from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';

const ExpiryCalendarView = ({ expiringUnits, isLoading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const todayBg = useColorModeValue('blue.50', 'blue.900');
  
  useEffect(() => {
    // Generate calendar days for current week and next 2 weeks
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
    const days = [];
    
    // Generate 21 days (3 weeks)
    for (let i = 0; i < 21; i++) {
      days.push(addDays(start, i));
    }
    
    setCalendarDays(days);
  }, [currentDate]);
  
  const getColorScheme = (expiringCount) => {
    if (expiringCount === 0) return 'gray';
    if (expiringCount <= 2) return 'yellow';
    if (expiringCount <= 5) return 'orange';
    return 'red';
  };
  
  const getUnitsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return expiringUnits?.filter(unit => unit.expiryDate === dateStr) || [];
  };
  
  const nextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };
  
  const prevWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };
  
  const today = new Date();
  
  return (
    <Box bg={cardBg} p={4} borderRadius="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h3" size="md">Expiry Calendar</Heading>
        
        <HStack>
          <IconButton 
            icon={<FaChevronLeft />} 
            onClick={prevWeek} 
            aria-label="Previous week" 
            size="sm"
            variant="ghost"
          />
          <Text fontWeight="medium">
            {format(calendarDays[0], 'MMM d')} - {format(calendarDays[20], 'MMM d')}
          </Text>
          <IconButton 
            icon={<FaChevronRight />} 
            onClick={nextWeek} 
            aria-label="Next week" 
            size="sm"
            variant="ghost"
          />
        </HStack>
      </Flex>
      
      {isLoading ? (
        <Flex justify="center" align="center" py={8}>
          <Spinner size="lg" thickness="3px" color="blue.500" />
        </Flex>
      ) : (
        <SimpleGrid columns={7} spacing={2} mb={2}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <Box key={day} textAlign="center" fontWeight="bold" fontSize="sm">
              {day}
            </Box>
          ))}
          
          {calendarDays.map((day, index) => {
            const units = getUnitsForDate(day);
            const isToday = isSameDay(day, today);
            
            return (
              <Box 
                key={index} 
                height="70px" 
                p={2} 
                borderWidth="1px" 
                borderColor={borderColor} 
                borderRadius="md"
                bg={isToday ? todayBg : 'transparent'}
                position="relative"
              >
                <Text 
                  fontSize="sm" 
                  fontWeight={isToday ? 'bold' : 'normal'}
                  mb={1}
                >
                  {format(day, 'd')}
                </Text>
                
                {units.length > 0 ? (
                  <Tooltip 
                    label={
                      <>
                        {units.map((unit, idx) => (
                          <Text key={idx}>{unit.bloodType} ({unit.id})</Text>
                        ))}
                      </>
                    }
                    placement="top"
                    hasArrow
                  >
                    <Badge 
                      colorScheme={getColorScheme(units.length)} 
                      position="absolute"
                      bottom="2"
                      right="2"
                    >
                      {units.length}
                    </Badge>
                  </Tooltip>
                ) : null}
              </Box>
            );
          })}
        </SimpleGrid>
      )}
      
      <Text fontSize="sm" color="gray.500" mt={4}>
        Calendar shows blood units expiring on each day. Hover over a badge to see details.
      </Text>
    </Box>
  );
};

export default ExpiryCalendarView;
