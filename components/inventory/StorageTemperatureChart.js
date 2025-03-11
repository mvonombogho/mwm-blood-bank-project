import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Flex, Select, HStack, IconButton,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Button, ButtonGroup, useColorModeValue, Spinner,
  Alert, AlertIcon, useToast
} from '@chakra-ui/react';
import { FaArrowLeft, FaArrowRight, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StorageTemperatureChart = ({ storageUnitId }) => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('day');
  const [temperatureRange, setTemperatureRange] = useState(null);
  
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    if (!storageUnitId) {
      setError('No storage unit selected');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    // Fetch temperature data from API
    fetchTemperatureData();
  }, [storageUnitId, timeRange]);
  
  const fetchTemperatureData = async () => {
    try {
      const response = await fetch(`/api/inventory/storage/temperature-logs?storageUnitId=${storageUnitId}&period=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch temperature logs');
      }
      
      const data = await response.json();
      
      // Process data for chart
      const labels = data.readings.map(reading => 
        timeRange === 'day' 
          ? reading.time.split(' ')[1] // Just show time for day view
          : reading.time // Show date + time for week/month
      );
      
      const temperatures = data.readings.map(reading => reading.temperature);
      
      // Set temperature range for reference lines
      if (data.temperatureRange) {
        setTemperatureRange(data.temperatureRange);
      }
      
      // Create chart dataset
      setChartData({
        labels,
        datasets: [
          {
            label: 'Temperature',
            data: temperatures,
            borderColor: 'rgba(53, 162, 235, 1)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.2
          }
        ]
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching temperature data:', error);
      setError('Failed to load temperature data. Please try again later.');
      setIsLoading(false);
      
      // Show a fallback with mock data for development
      createFallbackData();
    }
  };
  
  // Fallback with mock data if API fails
  const createFallbackData = () => {
    const labels = generateTimeLabels(timeRange);
    
    const getRandom = (min, max, fixed) => {
      return (Math.random() * (max - min) + min).toFixed(fixed);
    };
    
    const points = timeRange === 'day' ? 24 : timeRange === 'week' ? 28 : 30;
    
    // Generate mock temperature data
    const temperatures = [];
    for (let i = 0; i < points; i++) {
      temperatures.push(getRandom(2, 6, 1));
    }
    
    setTemperatureRange({
      min: 2,
      max: 8,
      target: 4,
      units: 'Celsius'
    });
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Temperature (Mock Data)',
          data: temperatures,
          borderColor: 'rgba(53, 162, 235, 1)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          tension: 0.2
        }
      ]
    });
    
    toast({
      title: 'Using mock data',
      description: 'Could not load actual temperature data. Showing simulated values.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    });
  };
  
  // Generate time labels based on selected time range (for fallback)
  const generateTimeLabels = (range) => {
    const now = new Date();
    const labels = [];
    
    switch (range) {
      case 'day':
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now);
          date.setHours(now.getHours() - i);
          labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        break;
      case 'week':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          // Add 4 data points per day for a week
          for (let j = 0; j < 4; j++) {
            labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
              ' ' + (j * 6) + ':00');
          }
        }
        break;
      case 'month':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
        }
        break;
      default:
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now);
          date.setHours(now.getHours() - i);
          labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
    }
    
    return labels;
  };
  
  // Chart options
  const getChartOptions = () => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}°${temperatureRange?.units || 'C'}`;
            }
          }
        }
      },
      scales: {
        y: {
          title: {
            display: true,
            text: `Temperature (°${temperatureRange?.units || 'C'})`
          }
        },
        x: {
          title: {
            display: true,
            text: timeRange === 'day' ? 'Time (hours)' : 'Date'
          }
        }
      }
    };
    
    // Add reference lines for temperature range if available
    if (temperatureRange) {
      options.plugins.annotation = {
        annotations: {
          minLine: {
            type: 'line',
            yMin: temperatureRange.min,
            yMax: temperatureRange.min,
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `Min: ${temperatureRange.min}°${temperatureRange.units}`,
              position: 'start'
            }
          },
          maxLine: {
            type: 'line',
            yMin: temperatureRange.max,
            yMax: temperatureRange.max,
            borderColor: 'rgba(255, 99, 132, 0.5)',
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `Max: ${temperatureRange.max}°${temperatureRange.units}`,
              position: 'start'
            }
          },
          targetLine: {
            type: 'line',
            yMin: temperatureRange.target,
            yMax: temperatureRange.target,
            borderColor: 'rgba(75, 192, 192, 0.5)',
            borderWidth: 2,
            label: {
              display: true,
              content: `Target: ${temperatureRange.target}°${temperatureRange.units}`,
              position: 'start'
            }
          }
        }
      };
    }
    
    return options;
  };
  
  return (
    <Box bg={cardBg} p={4} borderRadius="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h3" size="md">Temperature History</Heading>
        
        <ButtonGroup size="sm" isAttached variant="outline">
          <Button 
            isActive={timeRange === 'day'} 
            onClick={() => setTimeRange('day')}
          >
            24h
          </Button>
          <Button 
            isActive={timeRange === 'week'} 
            onClick={() => setTimeRange('week')}
          >
            7d
          </Button>
          <Button 
            isActive={timeRange === 'month'} 
            onClick={() => setTimeRange('month')}
          >
            30d
          </Button>
        </ButtonGroup>
      </Flex>
      
      {error ? (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      ) : isLoading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" thickness="4px" color="blue.500" />
        </Flex>
      ) : chartData ? (
        <Box height="300px">
          <Line data={chartData} options={getChartOptions()} />
        </Box>
      ) : (
        <Flex justify="center" align="center" height="300px">
          <Text>No temperature data available</Text>
        </Flex>
      )}
      
      {temperatureRange && !isLoading && (
        <Flex mt={4} flexWrap="wrap" gap={4}>
          <Stat size="sm">
            <StatLabel>Target Temperature</StatLabel>
            <StatNumber>{temperatureRange.target}°{temperatureRange.units}</StatNumber>
          </Stat>
          <Stat size="sm">
            <StatLabel>Safe Range</StatLabel>
            <StatNumber>{temperatureRange.min}° - {temperatureRange.max}°{temperatureRange.units}</StatNumber>
          </Stat>
        </Flex>
      )}
    </Box>
  );
};

export default StorageTemperatureChart;
