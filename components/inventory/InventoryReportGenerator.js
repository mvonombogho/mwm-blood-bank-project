import { useState, useEffect } from 'react';
import {
  Box, Heading, FormControl, FormLabel, Select, Button,
  Stack, Checkbox, CheckboxGroup, HStack, Divider, Text,
  useColorModeValue, useToast, SimpleGrid, Card, CardBody,
  CardHeader, Icon, VStack, Alert, AlertIcon, Flex,
  Spinner, IconButton
} from '@chakra-ui/react';
import { FaFileAlt, FaFileExcel, FaFilePdf, FaDownload, FaChartBar, FaSync } from 'react-icons/fa';

const InventoryReportGenerator = () => {
  const [reportType, setReportType] = useState('inventory-summary');
  const [timeRange, setTimeRange] = useState('current');
  const [bloodTypes, setBloodTypes] = useState(['all']);
  const [format, setFormat] = useState('pdf');
  const [includeOptions, setIncludeOptions] = useState(['charts', 'tables']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Fetch available reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);
  
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/inventory/reports');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      
      const data = await response.json();
      setReports(data.reports || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Create request payload
      const payload = {
        reportType,
        timeRange,
        bloodTypes,
        includeOptions,
        format
      };
      
      // Call the report generation API
      const response = await fetch('/api/inventory/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate report');
      }
      
      // Parse the response
      const data = await response.json();
      
      toast({
        title: 'Report Generated',
        description: `Your report "${data.report.title}" has been generated successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh the reports list
      fetchReports();
    } catch (err) {
      console.error('Error generating report:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to generate report. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownloadReport = (reportId) => {
    // Redirect to the download endpoint
    window.open(`/api/inventory/reports/download/${reportId}`, '_blank');
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h3" size="md">
              Available Reports
            </Heading>
            <IconButton
              icon={<FaSync />}
              aria-label="Refresh reports"
              size="sm"
              onClick={fetchReports}
              isLoading={isLoading}
            />
          </Flex>
          
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          )}
          
          {isLoading ? (
            <Flex justify="center" align="center" h="200px">
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : reports.length === 0 ? (
            <Flex 
              justify="center" 
              align="center" 
              h="200px" 
              direction="column"
              bg={cardBg}
              p={6}
              borderRadius="lg"
              shadow="md"
            >
              <Text mb={2}>No reports available yet.</Text>
              <Text fontSize="sm" color="gray.500">
                Generate a new report to see it listed here.
              </Text>
            </Flex>
          ) : (
            <Stack spacing={4}>
              {reports.map((report) => (
                <ReportCard 
                  key={report.reportId}
                  title={report.title}
                  date={report.createdAt}
                  type={report.format}
                  size={report.fileSize}
                  description={report.description}
                  reportId={report.reportId}
                  onDownload={handleDownloadReport}
                />
              ))}
            </Stack>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
};

const ReportCard = ({ title, date, type, size, description, reportId, onDownload }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  return (
    <Card bg={cardBg} variant="outline" size="sm">
      <CardHeader pb={2}>
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon as={getReportIcon(type)} color={type === 'pdf' ? 'red.500' : type === 'excel' ? 'green.500' : 'blue.500'} boxSize={5} />
            <Heading size="sm">{title}</Heading>
          </HStack>
          <Button 
            rightIcon={<FaDownload />} 
            size="xs" 
            variant="ghost"
            onClick={() => onDownload(reportId)}
          >
            Download
          </Button>
        </Flex>
      </CardHeader>
      <CardBody pt={0}>
        <Text fontSize="sm" color="gray.500" mb={1}>
          {description}
        </Text>
        <HStack fontSize="xs" color="gray.500">
          <Text>Generated: {new Date(date).toLocaleDateString()}</Text>
          <Text>•</Text>
          <Text>{typeof size === 'number' ? formatFileSize(size) : size}</Text>
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

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default InventoryReportGenerator;