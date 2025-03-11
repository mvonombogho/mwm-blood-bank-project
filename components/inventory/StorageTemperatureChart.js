import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Flex, Select, HStack, IconButton,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow,
  Button, ButtonGroup, useColorModeValue, Spinner
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

const StorageTemperatureChart = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Generate mock data based on selectedUnit and timeRange
      const labels = generateTimeLabels(timeRange);
      const datasets = generateDatasets(selectedUnit, timeRange);
      
      setChartData({
        labels,
        datasets
      });
      
      setIsLoading(false);
    }, 1000);
  }, [selectedUnit, timeRange]);
  
  // Generate time labels based on selected time range
  const generateTimeLabels = (range) => {
    const now = new Date();
    const labels = [];
    
    switch (range) {
      case '24h':
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now);
          date.setHours(now.getHours() - i);
          labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
        break;
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
        }
        break;
      case '30d':
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          const day = date.getDate();
          if (day === 1 || day === 5 || day === 10 || day === 15 || day === 20 || day === 25 || i === 0) {
            labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
          } else {
            labels.push('');
          }
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
  
  // Generate datasets based on selected storage unit
  const generateDatasets = (unit, range) => {
    const datasets = [];
    const getRandom = (min, max, fixed) => {
      return (Math.random() * (max - min) + min).toFixed(fixed);
    };
    
    const points = range === '24h' ? 24 : range === '7d' ? 7 : 30;
    
    if (unit === 'all' || unit === 'SU001') {
      // Main Refrigerator - target -2.0°C
      const data = [];
      for (let i = 0; i < points; i++) {
        data.push(getRandom(-2.5, -1.5, 1));
      }
      datasets.push({
        label: 'Main Refrigerator',
        data,
        borderColor: 'rgba(53, 162, 235, 1)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.2
      });
    }
    
    if (unit === 'all' || unit === 'SU002') {
      // Plasma Freezer - target -30.0°C
      const data = [];
      for (let i = 0; i < points; i++) {
        data.push(getRandom(-30.5, -29.5, 1));
      }
      datasets.push({
        label: 'Plasma Freezer',
        data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.2
      });
    }
    
    if (unit === 'all' || unit === 'SU003') {
      // Platelet Incubator - target 22.0°C
      const data = [];
      for (let i = 0; i < points; i++) {
        data.push(getRandom(21.8, 22.5, 1));
      }
      datasets.push({
        label: 'Platelet Incubator',
        data,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.2
      });
    }
    
    if (unit === 'all' || unit === 'SU004') {
      // Transport Cooler - target 4.0°C
      const data = [];
      for (let i = 0; i < points; i++) {
        data.push(getRandom(3.5, 4.5, 1));
      }
      datasets.push({
        label: 'Transport Cooler',
        data,
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.2
      });
    }
    
    return datasets;
  };
  
  // Chart options
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
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      },
      x: {
        title: {
          display: true,
          text: timeRange === '24h' ? 'Time (hours)' : 'Date'
        }
      }
    }
  };
  
  return (
    <Box bg={cardBg} p={4} borderRadius="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h3" size="md">Temperature Monitoring</Heading>
        
        <HStack spacing={4}>
          <Select 
            value={selectedUnit} 
            onChange={(e) => setSelectedUnit(e.target.value)}
            maxW="200px"
            size="sm"
          >
            <option value="all">All Units</option>
            <option value="SU001">Main Refrigerator</option>
            <option value="SU002">Plasma Freezer</option>
            <option value="SU003">Platelet Incubator</option>
            <option value="SU004">Transport Cooler</option>
          </Select>
          
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button 
              isActive={timeRange === '24h'} 
              onClick={() => setTimeRange('24h')}
            >
              24h
            </Button>
            <Button 
              isActive={timeRange === '7d'} 
              onClick={() => setTimeRange('7d')}
            >
              7d
            </Button>
            <Button 
              isActive={timeRange === '30d'} 
              onClick={() => setTimeRange('30d')}
            >
              30d
            </Button>
          </ButtonGroup>
        </HStack>
      </Flex>
      
      {isLoading ? (
        <Flex justify="center" align="center" height="300px">
          <Spinner size="xl" thickness="4px" color="blue.500" />
        </Flex>
      ) : (
        <Box height="300px">
          {chartData && <Line data={chartData} options={options} />}
        </Box>
      )}
    </Box>
  );
};

export default StorageTemperatureChart;
