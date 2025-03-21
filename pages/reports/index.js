import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  Icon,
  Flex,
  Stack,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Select,
  FormControl,
  FormLabel,
  Input,
  HStack,
  useColorModeValue,
  Alert,
  AlertIcon,
  useToast,
  Container
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiBarChart2, 
  FiPieChart, 
  FiCalendar, 
  FiUsers, 
  FiDroplet, 
  FiList,
  FiCheck
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('inventory-status');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [outputFormat, setOutputFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  const toast = useToast();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status !== 'loading') {
      fetchReports();
    }
  }, [status, categoryFilter]);
  
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reports/list?category=${categoryFilter}`);
      setReports(response.data.reports);
      setError(null);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      
      // Create parameters object
      const params = {
        type: reportType,
        format: outputFormat
      };
      
      // Add date range if provided
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      
      // Call API to download the report directly
      window.location.href = `/api/reports/download?report=${reportType}&format=${outputFormat}`;
      
      toast({
        title: 'Report Generated',
        description: 'Your report has been generated and download started.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error generating report:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = (report, format = 'pdf') => {
    // Construct the download URL
    const downloadUrl = `/api/reports/download?report=${report.type}&id=${report.id}&format=${format}`;
    
    // Trigger download
    window.location.href = downloadUrl;
  };
  
  const getCategoryColor = (category) => {
    switch(category) {
      case 'Donations':
        return 'green';
      case 'Inventory':
        return 'blue';
      case 'Donors':
        return 'purple';
      case 'Recipients':
        return 'orange';
      default:
        return 'gray';
    }
  };
  
  const getIconByType = (iconType) => {
    switch(iconType) {
      case 'barChart':
        return FiBarChart2;
      case 'pieChart':
        return FiPieChart;
      case 'calendar':
        return FiCalendar;
      case 'users':
        return FiUsers;
      case 'droplet':
        return FiDroplet;
      case 'list':
        return FiList;
      default:
        return FiBarChart2;
    }
  };
  
  if (status === 'loading') {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Flex justify="center" align="center" h="50vh">
            <Spinner size="xl" />
          </Flex>
        </Container>
      </Layout>
    );
  }
  
  if (!session) {
    return (
      <Layout>
        <Container maxW="container.xl" py={6}>
          <Heading as="h1" size="xl" mb={6}>Reports</Heading>
          <Text>Please sign in to access this page.</Text>
        </Container>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxW="container.xl" py={6}>
        <Heading as="h1" size="xl" mb={6}>Reports</Heading>
        
        <Flex 
          justify="space-between" 
          align="center" 
          mb={6}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
        >
          <Text fontSize="lg" color="gray.600">
            Generate and manage reports for donors, inventory, and transfusions.
          </Text>
          
          <HStack spacing={4}>
            <Select 
              placeholder="Filter by category" 
              maxW="200px" 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Donations">Donations</option>
              <option value="Inventory">Inventory</option>
              <option value="Donors">Donors</option>
              <option value="Recipients">Recipients</option>
            </Select>
          </HStack>
        </Flex>
        
        {loading ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : error ? (
          <Alert status="error" mb={6}>
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <>
            {/* Available Reports */}
            <Heading as="h2" size="lg" mb={4}>Available Reports</Heading>
            <Card bg={bgColor} boxShadow="sm" mb={6}>
              <CardBody p={0}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Report Name</Th>
                      <Th>Category</Th>
                      <Th>Last Generated</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {reports.length > 0 ? (
                      reports.map((report) => (
                        <Tr key={report.id}>
                          <Td>
                            <Flex align="center">
                              <Icon 
                                as={getIconByType(report.iconType)} 
                                mr={3} 
                                color={`${getCategoryColor(report.category)}.500`} 
                              />
                              <Box>
                                <Text fontWeight="medium">{report.title}</Text>
                                <Text fontSize="sm" color="gray.500">{report.description}</Text>
                              </Box>
                            </Flex>
                          </Td>
                          <Td>
                            <Badge colorScheme={getCategoryColor(report.category)}>
                              {report.category}
                            </Badge>
                          </Td>
                          <Td>{new Date(report.lastGenerated).toLocaleDateString()}</Td>
                          <Td>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="blue"
                              leftIcon={<FiBarChart2 />}
                              onClick={() => router.push(report.viewPath)}
                              mr={2}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="green"
                              leftIcon={<FiDownload />}
                              onClick={() => handleDownload(report, 'pdf')}
                            >
                              Export
                            </Button>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={4} textAlign="center" py={4}>
                          No reports found. Generate a new report below.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
            
            {/* Custom Report Generator */}
            <Card bg={bgColor} boxShadow="md" mb={6}>
              <CardHeader>
                <Heading size="md">Generate Custom Report</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Report Type</FormLabel>
                    <Select 
                      placeholder="Select report type"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="inventory-status">Inventory Status Report</option>
                      <option value="donation-statistics">Donations Report</option>
                      <option value="donor-demographics">Donor Demographics Report</option>
                      <option value="expiry-forecast">Expiry Forecast Report</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Date Range</FormLabel>
                    <HStack>
                      <Input 
                        type="date" 
                        placeholder="Start date" 
                        value={dateRange.startDate}
                        onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                      />
                      <Input 
                        type="date" 
                        placeholder="End date" 
                        value={dateRange.endDate}
                        onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                      />
                    </HStack>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Output Format</FormLabel>
                    <Select 
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
                
                <Button
                  mt={6}
                  colorScheme="blue"
                  leftIcon={<FiBarChart2 />}
                  onClick={handleGenerateReport}
                  isLoading={isGenerating}
                  loadingText="Generating..."
                >
                  Generate Report
                </Button>
              </CardBody>
            </Card>
          </>
        )}
      </Container>
    </Layout>
  );
};

export default ReportsPage;