import { useState } from 'react';
import {
  Box, Heading, FormControl, FormLabel, Select, Button,
  Stack, Checkbox, CheckboxGroup, HStack, Divider, Text,
  useColorModeValue, useToast, SimpleGrid, Card, CardBody,
  CardHeader, Icon, VStack, Alert, AlertIcon, Flex
} from '@chakra-ui/react';
import { FaFileAlt, FaFileExcel, FaFilePdf, FaDownload, FaChartBar } from 'react-icons/fa';

const InventoryReportGenerator = () => {
  const [reportType, setReportType] = useState('inventory-summary');
  const [timeRange, setTimeRange] = useState('current');
  const [bloodTypes, setBloodTypes] = useState(['all']);
  const [format, setFormat] = useState('pdf');
  const [includeOptions, setIncludeOptions] = useState(['charts', 'tables']);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    // Simulate report generation delay
    setTimeout(() => {
      setIsGenerating(false);
      
      toast({
        title: 'Report Generated',
        description: 'Your report has been generated successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }, 2000);
  };
  
  const handleBloodTypeChange = (values) => {
    // If 'all' is selected, deselect all other options
    // If another option is selected when 'all' is already selected, deselect 'all'
    if (values.includes('all') && values.length > 1) {
      if (bloodTypes.includes('all')) {
        setBloodTypes(values.filter(v => v !== 'all'));
      } else {
        setBloodTypes(['all']);
      }
    } else {
      setBloodTypes(values);
    }
  };
  
  const getReportDescription = (type) => {
    switch (type) {
      case 'inventory-summary':
        return 'Overview of current blood inventory levels, including all blood types and their availability.';
      case 'expiry-analysis':
        return 'Analysis of blood units expiring in the near future, grouped by expiry date and blood type.';
      case 'historical-trends':
        return 'Historical trends of blood inventory levels, donations, and usage over the selected time period.';
      case 'storage-conditions':
        return 'Report on storage conditions including temperature logs, alerts, and maintenance records.';
      case 'critical-shortage':
        return 'Focused report on blood types currently in critical shortage or below target levels.';
      default:
        return '';
    }
  };
  
  return (
    <Box>
      <Alert status="info" mb={6} borderRadius="md">
        <AlertIcon />
        <Text>
          Generate comprehensive inventory reports for analysis, compliance, and planning purposes.
        </Text>
      </Alert>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Stack spacing={6}>
          <Box bg={cardBg} p={6} borderRadius="lg" shadow="md">
            <Heading as="h3" size="md" mb={4}>
              Report Configuration
            </Heading>
            
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Report Type</FormLabel>
                <Select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option value="inventory-summary">Inventory Summary</option>
                  <option value="expiry-analysis">Expiry Analysis</option>
                  <option value="historical-trends">Historical Trends</option>
                  <option value="storage-conditions">Storage Conditions</option>
                  <option value="critical-shortage">Critical Shortage Analysis</option>
                </Select>
              </FormControl>
              
              <Text fontSize="sm" color="gray.500">
                {getReportDescription(reportType)}
              </Text>
              
              <Divider />
              
              <FormControl>
                <FormLabel>Time Range</FormLabel>
                <Select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="current">Current Snapshot</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                  <option value="custom">Custom Range</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Blood Types</FormLabel>
                <CheckboxGroup colorScheme="red" value={bloodTypes} onChange={handleBloodTypeChange}>
                  <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={2}>
                    <Checkbox value="all">All Types</Checkbox>
                    <Checkbox value="A+">A+</Checkbox>
                    <Checkbox value="A-">A-</Checkbox>
                    <Checkbox value="B+">B+</Checkbox>
                    <Checkbox value="B-">B-</Checkbox>
                    <Checkbox value="AB+">AB+</Checkbox>
                    <Checkbox value="AB-">AB-</Checkbox>
                    <Checkbox value="O+">O+</Checkbox>
                    <Checkbox value="O-">O-</Checkbox>
                  </SimpleGrid>
                </CheckboxGroup>
              </FormControl>
              
              <FormControl>
                <FormLabel>Report Format</FormLabel>
                <HStack spacing={4}>
                  <Button 
                    leftIcon={<FaFilePdf />} 
                    variant={format === 'pdf' ? 'solid' : 'outline'} 
                    colorScheme="red"
                    onClick={() => setFormat('pdf')}
                    size="sm"
                  >
                    PDF
                  </Button>
                  <Button 
                    leftIcon={<FaFileExcel />} 
                    variant={format === 'excel' ? 'solid' : 'outline'} 
                    colorScheme="green"
                    onClick={() => setFormat('excel')}
                    size="sm"
                  >
                    Excel
                  </Button>
                  <Button 
                    leftIcon={<FaFileAlt />} 
                    variant={format === 'csv' ? 'solid' : 'outline'} 
                    colorScheme="blue"
                    onClick={() => setFormat('csv')}
                    size="sm"
                  >
                    CSV
                  </Button>
                </HStack>
              </FormControl>
              
              <FormControl>
                <FormLabel>Include</FormLabel>
                <CheckboxGroup colorScheme="blue" value={includeOptions} onChange={setIncludeOptions}>
                  <HStack spacing={4}>
                    <Checkbox value="charts">Charts</Checkbox>
                    <Checkbox value="tables">Tables</Checkbox>
                    <Checkbox value="recommendations">Recommendations</Checkbox>
                  </HStack>
                </CheckboxGroup>
              </FormControl>
            </Stack>
          </Box>
          
          <Button 
            colorScheme="blue" 
            size="lg" 
            leftIcon={<FaChartBar />}
            onClick={handleGenerateReport}
            isLoading={isGenerating}
            loadingText="Generating Report"
          >
            Generate Report
          </Button>
        </Stack>
        
        <Box>
          <Heading as="h3" size="md" mb={4}>
            Available Reports
          </Heading>
          
          <Stack spacing={4}>
            <ReportCard 
              title="Monthly Inventory Summary"
              date="2025-03-01"
              type="pdf"
              size="2.4 MB"
              description="Monthly summary of blood inventory levels, donations and usage."
            />
            
            <ReportCard 
              title="Q1 2025 Inventory Analysis"
              date="2025-02-15"
              type="excel"
              size="4.1 MB"
              description="Quarterly inventory analysis with trends and recommendations."
            />
            
            <ReportCard 
              title="Blood Expiry Report - February"
              date="2025-02-05"
              type="pdf"
              size="1.8 MB"
              description="Analysis of blood units that expired in February 2025."
            />
            
            <ReportCard 
              title="Storage Conditions - Annual Report"
              date="2025-01-05"
              type="excel"
              size="5.6 MB"
              description="Annual report of storage conditions and maintenance records."
            />
          </Stack>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

const ReportCard = ({ title, date, type, size, description }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  return (
    <Card bg={cardBg} variant="outline" size="sm">
      <CardHeader pb={2}>
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon as={getReportIcon(type)} color={type === 'pdf' ? 'red.500' : type === 'excel' ? 'green.500' : 'blue.500'} boxSize={5} />
            <Heading size="sm">{title}</Heading>
          </HStack>
          <Button rightIcon={<FaDownload />} size="xs" variant="ghost">
            Download
          </Button>
        </Flex>
      </CardHeader>
      <CardBody pt={0}>
        <Text fontSize="sm" color="gray.500" mb={1}>
          {description}
        </Text>
        <HStack fontSize="xs" color="gray.500">
          <Text>Generated: {date}</Text>
          <Text>•</Text>
          <Text>{size}</Text>
          <Text>•</Text>
          <Text>{type.toUpperCase()}</Text>
        </HStack>
      </CardBody>
    </Card>
  );
};

const getReportIcon = (type) => {
  switch (type) {
    case 'pdf':
      return FaFilePdf;
    case 'excel':
      return FaFileExcel;
    case 'csv':
      return FaFileAlt;
    default:
      return FaFileAlt;
  }
};

export default InventoryReportGenerator;