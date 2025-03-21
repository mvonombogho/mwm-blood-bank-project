import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  HStack,
  Icon,
  Divider,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiBarChart2, 
  FiCalendar, 
  FiPrinter, 
  FiArrowLeft,
  FiChevronDown 
} from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  generateCSV, 
  generatePDF, 
  generateExcel, 
  downloadFile,
  prepareDonationReport 
} from '../../../lib/reportUtils';

const MonthlyDonationReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);
  
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Mock data for donation report
  const mockData = {
    totalDonations: 245,
    totalDonors: 189,
    newDonors: 23,
    returnDonors: 166,
    averagePerDay: 8.2,
    percentChange: 12.5,
    byBloodType: {
      'A+': 62,
      'A-': 15,
      'B+': 35,
      'B-': 9,
      'AB+': 12,
      'AB-': 3,
      'O+': 98,
      'O-': 11
    },
    byWeek: [
      { week: 'Week 1', count: 51 },
      { week: 'Week 2', count: 67 },
      { week: 'Week 3', count: 58 },
      { week: 'Week 4', count: 69 }
    ],
    byLocation: [
      { location: 'Main Center', count: 105 },
      { location: 'Downtown Clinic', count: 72 },
      { location: 'Westside Hospital', count: 43 },
      { location: 'Mobile Drive - University', count: 25 }
    ],
    recentDonations: [
      { id: 'D-20230615-001', donor: 'John Smith', bloodType: 'O+', date: '2023-06-15', location: 'Main Center' },
      { id: 'D-20230615-002', donor: 'Maria Garcia', bloodType: 'A+', date: '2023-06-15', location: 'Downtown Clinic' },
      { id: 'D-20230614-001', donor: 'Robert Johnson', bloodType: 'B+', date: '2023-06-14', location: 'Westside Hospital' },
      { id: 'D-20230614-002', donor: 'Emily Chen', bloodType: 'AB+', date: '2023-06-14', location: 'Main Center' },
      { id: 'D-20230613-001', donor: 'David Wilson', bloodType: 'O-', date: '2023-06-13', location: 'Downtown Clinic' }
    ]
  };
  
  useEffect(() => {
    // In a real app, fetch data from API with month and year parameters
    // For now, use mock data
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, [month, year]);
  
  const getMonthName = (monthIndex) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  };
  
  const getMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => (
      <option key={i} value={i}>{getMonthName(i)}</option>
    ));
  };
  
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => (
      <option key={i} value={currentYear - i}>{currentYear - i}</option>
    ));
  };
  
  // Prepare the report data for export
  const prepareReportData = () => {
    if (!data) return null;
    
    // Convert blood type data to array format for CSV/Excel export
    const bloodTypeData = Object.entries(data.byBloodType).map(([type, count]) => ({
      bloodType: type,
      count,
      percentage: ((count / data.totalDonations) * 100).toFixed(1) + '%'
    }));
    
    // Convert recent donations for export
    const donationsForExport = data.recentDonations.map(d => ({
      id: d.id,
      donor: d.donor,
      bloodType: d.bloodType,
      date: new Date(d.date).toLocaleDateString(),
      location: d.location
    }));
    
    return {
      title: `Monthly Donation Report - ${getMonthName(month)} ${year}`,
      date: new Date().toISOString(),
      summary: {
        month: getMonthName(month),
        year,
        totalDonations: data.totalDonations,
        totalDonors: data.totalDonors,
        newDonors: data.newDonors,
        returnDonors: data.returnDonors,
        averagePerDay: data.averagePerDay,
        percentChange: data.percentChange + '%'
      },
      sheets: {
        'Summary': {
          totalDonations: data.totalDonations,
          totalDonors: data.totalDonors,
          newDonors: data.newDonors,
          returnDonors: data.returnDonors,
          averagePerDay: data.averagePerDay,
          percentChange: data.percentChange + '%'
        },
        'By Blood Type': bloodTypeData,
        'By Week': data.byWeek,
        'By Location': data.byLocation,
        'Recent Donations': donationsForExport
      },
      data: donationsForExport,
      period: `${getMonthName(month)} ${year}`
    };
  };
  
  // Handle exporting in different formats
  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      
      // Prepare the report data
      const reportData = prepareReportData();
      if (!reportData) throw new Error('No data available for export');
      
      const currentDate = new Date().toISOString().split('T')[0];
      let fileData;
      let filename;
      let mimeType;
      
      // Generate the appropriate format
      switch (format) {
        case 'csv':
          // Export recent donations as CSV
          fileData = generateCSV(reportData.data);
          filename = `donations-${getMonthName(month).toLowerCase()}-${year}-${currentDate}.csv`;
          mimeType = 'text/csv';
          break;
          
        case 'excel':
          // In a real app, this would use a library like SheetJS
          fileData = generateExcel(reportData);
          filename = `donations-${getMonthName(month).toLowerCase()}-${year}-${currentDate}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
          
        case 'pdf':
          // In a real app, this would use a PDF generation library
          fileData = generatePDF(reportData);
          filename = `donations-${getMonthName(month).toLowerCase()}-${year}-${currentDate}.pdf`;
          mimeType = 'application/pdf';
          break;
          
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      // Download the file
      downloadFile(fileData, filename, mimeType);
      
      toast({
        title: 'Export successful',
        description: `Report exported as ${format.toUpperCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (err) {
      console.error('Export error:', err);
      toast({
        title: 'Export failed',
        description: err.message || 'Failed to export report',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle printing the report
  const handlePrint = () => {
    window.print();
  };

  return (
    <Box p={5}>
      <Flex align="center" mb={4}>
        <Button 
          leftIcon={<FiArrowLeft />} 
          variant="ghost" 
          onClick={() => router.push('/reports')}
          mr={4}
        >
          Back to Reports
        </Button>
        <Heading as="h1" size="xl">Monthly Donation Report</Heading>
      </Flex>
      
      <Flex 
        justify="space-between" 
        align="center"
        wrap="wrap"
        gap={4}
        mb={6}
      >
        <Text fontSize="lg" color="gray.600">
          Summary of blood donations for {getMonthName(month)} {year}
        </Text>
        
        <HStack spacing={4}>
          <Select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} maxW="150px">
            {getMonthOptions()}
          </Select>
          
          <Select value={year} onChange={(e) => setYear(parseInt(e.target.value))} maxW="120px">
            {getYearOptions()}
          </Select>
          
          <Button
            leftIcon={<FiPrinter />}
            colorScheme="blue"
            variant="outline"
            onClick={handlePrint}
          >
            Print
          </Button>
          
          <Menu>
            <MenuButton 
              as={Button} 
              rightIcon={<FiChevronDown />} 
              colorScheme="green"
              isLoading={isExporting}
              loadingText="Exporting"
            >
              <Flex align="center">
                <Icon as={FiDownload} mr={2} />
                Export
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
              <MenuItem onClick={() => handleExport('excel')}>Export as Excel</MenuItem>
              <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      {loading ? (
        <Flex justify="center" my={10}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : error ? (
        <Alert status="error" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      ) : (
        <>
          {/* Summary Stats */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>Total Donations</StatLabel>
                  <StatNumber>{data.totalDonations}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {data.percentChange}% since last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>Total Donors</StatLabel>
                  <StatNumber>{data.totalDonors}</StatNumber>
                  <StatHelpText>
                    {data.newDonors} new, {data.returnDonors} returning
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>Average Per Day</StatLabel>
                  <StatNumber>{data.averagePerDay}</StatNumber>
                  <StatHelpText>
                    donations per day
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel>Most Common Type</StatLabel>
                  <StatNumber>O+</StatNumber>
                  <StatHelpText>
                    {data.byBloodType['O+']} donations
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Blood Type Distribution */}
          <Card bg={bgColor} boxShadow="md" mb={8}>
            <CardHeader>
              <Heading size="md">Donations by Blood Type</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                {Object.entries(data.byBloodType).map(([type, count]) => (
                  <Box key={type} textAlign="center" p={4} borderWidth="1px" borderRadius="md">
                    <Badge 
                      colorScheme={
                        type.includes('O') ? 'green' : 
                        type.includes('A') ? 'blue' : 
                        type.includes('B') ? 'orange' : 'purple'
                      }
                      p={2}
                      fontSize="lg"
                      mb={2}
                    >
                      {type}
                    </Badge>
                    <Text fontWeight="bold" fontSize="2xl">{count}</Text>
                    <Text fontSize="sm" color="gray.500">donations</Text>
                  </Box>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
          
          {/* Weekly Distribution */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Donations by Week</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Week</Th>
                      <Th isNumeric>Donations</Th>
                      <Th isNumeric>Percentage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.byWeek.map((item) => (
                      <Tr key={item.week}>
                        <Td>{item.week}</Td>
                        <Td isNumeric>{item.count}</Td>
                        <Td isNumeric>
                          {((item.count / data.totalDonations) * 100).toFixed(1)}%
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Donations by Location</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Location</Th>
                      <Th isNumeric>Donations</Th>
                      <Th isNumeric>Percentage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.byLocation.map((item) => (
                      <Tr key={item.location}>
                        <Td>{item.location}</Td>
                        <Td isNumeric>{item.count}</Td>
                        <Td isNumeric>
                          {((item.count / data.totalDonations) * 100).toFixed(1)}%
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {/* Recent Donations */}
          <Card bg={bgColor} boxShadow="md" mb={8}>
            <CardHeader>
              <Heading size="md">Recent Donations</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Donation ID</Th>
                      <Th>Donor</Th>
                      <Th>Blood Type</Th>
                      <Th>Date</Th>
                      <Th>Location</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.recentDonations.map((donation) => (
                      <Tr key={donation.id}>
                        <Td fontWeight="medium">{donation.id}</Td>
                        <Td>{donation.donor}</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              donation.bloodType.includes('O') ? 'green' : 
                              donation.bloodType.includes('A') ? 'blue' : 
                              donation.bloodType.includes('B') ? 'orange' : 'purple'
                            }
                          >
                            {donation.bloodType}
                          </Badge>
                        </Td>
                        <Td>{new Date(donation.date).toLocaleDateString()}</Td>
                        <Td>{donation.location}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              
              <Button 
                mt={4} 
                colorScheme="blue" 
                variant="outline" 
                size="sm"
                rightIcon={<FiBarChart2 />}
                onClick={() => handleExport('csv')}
              >
                Export Full Data
              </Button>
            </CardBody>
          </Card>
        </>
      )}
    </Box>
  );
};

export default MonthlyDonationReport;