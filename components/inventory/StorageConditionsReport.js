import { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Flex, HStack, useColorModeValue, Spinner,
  ButtonGroup, Button, Select, SimpleGrid, Stat, Icon,
  StatLabel, StatNumber, StatHelpText, Card, CardBody,
  CardHeader, Tooltip, Tabs, TabList, TabPanels, Tab, TabPanel
} from '@chakra-ui/react';
import { FaThermometerHalf, FaExclamationTriangle, FaTools, FaChartLine } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

const StorageConditionsReport = () => {
  const [storageData, setStorageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const tableBg = useColorModeValue('white', 'gray.800');
  const tableBorderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    setIsLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      setStorageData(generateMockData(selectedUnit, timeRange));
      setIsLoading(false);
    }, 1200);
  }, [selectedUnit, timeRange]);
  
  const generateMockData = (unit, range) => {
    // Generate temperature readings
    const getTempReadings = (targetTemp, variability, days) => {
      const readings = [];
      const points = days === 7 ? 24 * 7 : days === 30 ? 30 : 90; // hourly for 7 days, daily for longer periods
      const interval = days === 7 ? 'hourly' : 'daily';
      
      for (let i = 0; i < points; i++) {
        // Add some random variation to the temperature
        const variation = (Math.random() - 0.5) * variability;
        readings.push(targetTemp + variation);
      }
      
      return { readings, interval };
    };
    
    // Generate labels for time axis
    const getLabels = (days, interval) => {
      const labels = [];
      const now = new Date();
      
      if (interval === 'hourly') {
        // For hourly data, show every 6th hour
        for (let i = 0; i < 24 * days; i++) {
          const date = new Date(now);
          date.setHours(now.getHours() - (24 * days - i));
          if (i % 6 === 0) {
            labels.push(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          } else {
            labels.push('');
          }
        }
      } else {
        // For daily data
        for (let i = 0; i < days; i++) {
          const date = new Date(now);
          date.setDate(now.getDate() - (days - i - 1));
          labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
        }
      }
      
      return labels;
    };
    
    // Storage units data
    const units = {
      'main-fridge': { name: 'Main Refrigerator', targetTemp: -2.0, variability: 0.3 },
      'plasma-freezer': { name: 'Plasma Freezer', targetTemp: -30.0, variability: 0.5 },
      'platelet-incubator': { name: 'Platelet Incubator', targetTemp: 22.0, variability: 0.2 },
      'transport-cooler': { name: 'Transport Cooler', targetTemp: 4.0, variability: 0.4 }
    };
    
    // Calculate days from range
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    
    // Generate datasets
    const datasets = [];
    const maintenanceRecords = [];
    const alarmRecords = [];
    
    if (unit === 'all') {
      // For all units, create a dataset for each
      Object.entries(units).forEach(([id, unitData], index) => {
        const { readings, interval } = getTempReadings(unitData.targetTemp, unitData.variability, days);
        
        datasets.push({
          unitId: id,
          name: unitData.name,
          targetTemp: unitData.targetTemp,
          readings,
          interval
        });
        
        // Add some maintenance records
        if (Math.random() > 0.5) {
          maintenanceRecords.push({
            id: `MR${index + 1}`,
            unitId: id,
            unitName: unitData.name,
            type: Math.random() > 0.5 ? 'Routine' : 'Calibration',
            date: new Date(Date.now() - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000)).toLocaleDateString(),
            technician: 'Tech ' + (index + 1),
            status: 'Completed',
            notes: 'Regular maintenance performed.'
          });
        }
        
        // Add some alarm records
        if (Math.random() > 0.7) {
          alarmRecords.push({
            id: `AL${index + 1}`,
            unitId: id,
            unitName: unitData.name,
            type: Math.random() > 0.5 ? 'Temperature' : 'Power',
            severity: Math.random() > 0.7 ? 'High' : 'Medium',
            date: new Date(Date.now() - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000)).toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Resolved',
            duration: `${Math.floor(Math.random() * 30) + 5}m`
          });
        }
      });
    } else {
      // For a specific unit
      const unitData = units[unit];
      if (unitData) {
        const { readings, interval } = getTempReadings(unitData.targetTemp, unitData.variability, days);
        
        datasets.push({
          unitId: unit,
          name: unitData.name,
          targetTemp: unitData.targetTemp,
          readings,
          interval
        });
        
        // Add a few maintenance records
        for (let i = 0; i < 2; i++) {
          if (Math.random() > 0.3) {
            maintenanceRecords.push({
              id: `MR${i + 1}`,
              unitId: unit,
              unitName: unitData.name,
              type: ['Routine', 'Calibration', 'Inspection'][Math.floor(Math.random() * 3)],
              date: new Date(Date.now() - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000)).toLocaleDateString(),
              technician: 'Tech ' + (i + 1),
              status: 'Completed',
              notes: 'Regular maintenance performed.'
            });
          }
        }
        
        // Add a few alarm records
        for (let i = 0; i < 3; i++) {
          if (Math.random() > 0.4) {
            alarmRecords.push({
              id: `AL${i + 1}`,
              unitId: unit,
              unitName: unitData.name,
              type: ['Temperature', 'Power', 'Door'][Math.floor(Math.random() * 3)],
              severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
              date: new Date(Date.now() - Math.floor(Math.random() * days * 24 * 60 * 60 * 1000)).toLocaleDateString(),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: Math.random() > 0.7 ? 'Active' : 'Resolved',
              duration: `${Math.floor(Math.random() * 30) + 5}m`
            });
          }
        }
      }
    }
    
    // Get labels for the chart
    const labels = getLabels(days, datasets[0]?.interval || 'daily');
    
    // Summary stats
    const summaryStats = {
      totalAlarms: alarmRecords.length,
      criticalAlarms: alarmRecords.filter(a => a.severity === 'High').length,
      maintenanceCount: maintenanceRecords.length,
      temperatureDeviation: Math.random() * 0.5
    };
    
    return {
      datasets,
      labels,
      maintenanceRecords,
      alarmRecords,
      summaryStats
    };
  };
  
  const getChartData = () => {
    if (!storageData) return { labels: [], datasets: [] };
    
    return {
      labels: storageData.labels,
      datasets: storageData.datasets.map((dataset, index) => {
        const colors = [
          { border: 'rgba(255, 99, 132, 1)', background: 'rgba(255, 99, 132, 0.5)' },
          { border: 'rgba(54, 162, 235, 1)', background: 'rgba(54, 162, 235, 0.5)' },
          { border: 'rgba(255, 206, 86, 1)', background: 'rgba(255, 206, 86, 0.5)' },
          { border: 'rgba(75, 192, 192, 1)', background: 'rgba(75, 192, 192, 0.5)' }
        ];
        
        return {
          label: dataset.name,
          data: dataset.readings,
          borderColor: colors[index % colors.length].border,
          backgroundColor: colors[index % colors.length].background,
          tension: 0.3,
          pointRadius: timeRange === '7d' ? 0 : 2, // Hide points for hourly data (too many)
        };
      })
    };
  };
  
  const chartOptions = {
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
            return `${context.dataset.label}: ${context.raw.toFixed(1)}°C`;
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Temperature (°C)'
        }
      }
    }
  };
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return 'red';
      case 'Medium': return 'orange';
      case 'Low': return 'yellow';
      default: return 'gray';
    }
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h3" size="md">Storage Conditions Report</Heading>
        
        <HStack spacing={4}>
          <Select 
            value={selectedUnit} 
            onChange={(e) => setSelectedUnit(e.target.value)}
            size="sm"
            maxW="200px"
          >
            <option value="all">All Storage Units</option>
            <option value="main-fridge">Main Refrigerator</option>
            <option value="plasma-freezer">Plasma Freezer</option>
            <option value="platelet-incubator">Platelet Incubator</option>
            <option value="transport-cooler">Transport Cooler</option>
          </Select>
          
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button 
              isActive={timeRange === '7d'} 
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </Button>
            <Button 
              isActive={timeRange === '30d'} 
              onClick={() => setTimeRange('30d')}
            >
              30 Days
            </Button>
            <Button 
              isActive={timeRange === '90d'} 
              onClick={() => setTimeRange('90d')}
            >
              90 Days
            </Button>
          </ButtonGroup>
        </HStack>
      </Flex>
      
      {isLoading ? (
        <Flex justify="center" align="center" py={8}>
          <Spinner size="xl" thickness="4px" color="blue.500" />
        </Flex>
      ) : storageData && (
        <Box>
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
            <StorageStatCard 
              icon={FaThermometerHalf}
              label="Temperature Deviation"
              value={`±${storageData.summaryStats.temperatureDeviation.toFixed(1)}°C`}
              colorScheme={storageData.summaryStats.temperatureDeviation > 0.3 ? 'orange' : 'green'}
            />
            <StorageStatCard 
              icon={FaExclamationTriangle}
              label="Total Alarms"
              value={storageData.summaryStats.totalAlarms}
              subtext={`${storageData.summaryStats.criticalAlarms} critical`}
              colorScheme="red"
            />
            <StorageStatCard 
              icon={FaTools}
              label="Maintenance Records"
              value={storageData.summaryStats.maintenanceCount}
              colorScheme="blue"
            />
            <StorageStatCard 
              icon={FaChartLine}
              label="Monitoring Period"
              value={timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : '90 Days'}
              colorScheme="purple"
            />
          </SimpleGrid>
          
          <Card bg={cardBg} mb={6} overflow="hidden">
            <CardHeader pb={0}>
              <Heading size="md">Temperature Trends</Heading>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <Line data={getChartData()} options={chartOptions} />
              </Box>
            </CardBody>
          </Card>
          
          <Tabs colorScheme="blue" mt={6}>
            <TabList>
              <Tab>Alarm Records</Tab>
              <Tab>Maintenance History</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={0} pt={4}>
                <Box bg={tableBg} shadow="md" borderRadius="lg" overflow="hidden">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Storage Unit</Th>
                        <Th>Type</Th>
                        <Th>Severity</Th>
                        <Th>Date</Th>
                        <Th>Time</Th>
                        <Th>Status</Th>
                        <Th>Duration</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {storageData.alarmRecords.length > 0 ? (
                        storageData.alarmRecords.map((alarm) => (
                          <Tr key={alarm.id}>
                            <Td>{alarm.id}</Td>
                            <Td>{alarm.unitName}</Td>
                            <Td>{alarm.type}</Td>
                            <Td>
                              <Badge colorScheme={getSeverityColor(alarm.severity)}>
                                {alarm.severity}
                              </Badge>
                            </Td>
                            <Td>{alarm.date}</Td>
                            <Td>{alarm.time}</Td>
                            <Td>
                              <Badge colorScheme={alarm.status === 'Resolved' ? 'green' : 'red'}>
                                {alarm.status}
                              </Badge>
                            </Td>
                            <Td>{alarm.duration}</Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={8} textAlign="center">
                            No alarm records found for the selected period/unit.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
              
              <TabPanel p={0} pt={4}>
                <Box bg={tableBg} shadow="md" borderRadius="lg" overflow="hidden">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Storage Unit</Th>
                        <Th>Type</Th>
                        <Th>Date</Th>
                        <Th>Technician</Th>
                        <Th>Status</Th>
                        <Th>Notes</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {storageData.maintenanceRecords.length > 0 ? (
                        storageData.maintenanceRecords.map((record) => (
                          <Tr key={record.id}>
                            <Td>{record.id}</Td>
                            <Td>{record.unitName}</Td>
                            <Td>{record.type}</Td>
                            <Td>{record.date}</Td>
                            <Td>{record.technician}</Td>
                            <Td>
                              <Badge colorScheme="green">
                                {record.status}
                              </Badge>
                            </Td>
                            <Td>{record.notes}</Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={7} textAlign="center">
                            No maintenance records found for the selected period/unit.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      )}
    </Box>
  );
};

const StorageStatCard = ({ icon, label, value, subtext, colorScheme }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const Icon = icon;
  
  return (
    <Box bg={cardBg} p={4} borderRadius="lg" shadow="sm">
      <Flex justify="space-between" align="center" mb={2}>
        <Text color="gray.500" fontWeight="medium">{label}</Text>
        {icon && <Icon color={`${colorScheme}.500`} size={18} />}
      </Flex>
      <Text fontSize="2xl" fontWeight="bold" color={`${colorScheme}.500`}>
        {value}
      </Text>
      {subtext && (
        <Text fontSize="sm" color="gray.500">
          {subtext}
        </Text>
      )}
    </Box>
  );
};

export default StorageConditionsReport;
