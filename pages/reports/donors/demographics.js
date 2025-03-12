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
  Alert,
  AlertIcon,
  HStack,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiArrowLeft, 
  FiUsers,
  FiMapPin,
  FiActivity
} from 'react-icons/fi';
import { useRouter } from 'next/router';
import NextLink from 'next/link';

const DonorDemographicsReport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Mock data for donor demographics
  const [demographicsData, setDemographicsData] = useState({
    genderDistribution: [],
    ageDistribution: [],
    bloodTypeDistribution: [],
    locationData: [],
    donorFrequency: [],
    totalDonors: 0,
    newDonorsThisMonth: 0,
    activeDonors: 0,
    avgDonationsPerDonor: 0
  });

  useEffect(() => {
    // In a real app, you would fetch from an API
    // For now, we'll use mock data and simulate loading
    setTimeout(() => {
      const mockData = {
        genderDistribution: [
          { gender: 'Male', count: 1245, percentage: 52.8 },
          { gender: 'Female', count: 1105, percentage: 46.8 },
          { gender: 'Other', count: 10, percentage: 0.4 }
        ],
        
        ageDistribution: [
          { ageGroup: '18-24', count: 520, percentage: 22.0 },
          { ageGroup: '25-34', count: 780, percentage: 33.1 },
          { ageGroup: '35-44', count: 580, percentage: 24.6 },
          { ageGroup: '45-54', count: 340, percentage: 14.4 },
          { ageGroup: '55-64', count: 120, percentage: 5.1 },
          { ageGroup: '65+', count: 20, percentage: 0.8 }
        ],
        
        bloodTypeDistribution: [
          { bloodType: 'O+', count: 960, percentage: 40.7 },
          { bloodType: 'A+', count: 540, percentage: 22.9 },
          { bloodType: 'B+', count: 360, percentage: 15.3 },
          { bloodType: 'AB+', count: 120, percentage: 5.1 },
          { bloodType: 'O-', count: 220, percentage: 9.3 },
          { bloodType: 'A-', count: 110, percentage: 4.7 },
          { bloodType: 'B-', count: 40, percentage: 1.7 },
          { bloodType: 'AB-', count: 10, percentage: 0.4 }
        ],
        
        locationData: [
          { location: 'Central District', count: 980, percentage: 41.5 },
          { location: 'Western Zone', count: 530, percentage: 22.5 },
          { location: 'Northern Area', count: 405, percentage: 17.2 },
          { location: 'Eastern Region', count: 320, percentage: 13.6 },
          { location: 'Southern District', count: 125, percentage: 5.3 }
        ],
        
        donorFrequency: [
          { frequency: 'First-time', count: 850, percentage: 36.0 },
          { frequency: '2-5 donations', count: 920, percentage: 39.0 },
          { frequency: '6-10 donations', count: 380, percentage: 16.1 },
          { frequency: '11+ donations', count: 210, percentage: 8.9 }
        ],
        
        totalDonors: 2360,
        newDonorsThisMonth: 85,
        activeDonors: 1760,
        avgDonationsPerDonor: 3.2
      };
      
      setDemographicsData(mockData);
      setLoading(false);
    }, 1000);
  }, []);
  
  return (
    <Box p={5}>
      <Flex align="center" mb={4}>
        <Button
          as={NextLink}
          href="/reports"
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          mr={4}
        >
          Back to Reports
        </Button>
        <Heading as="h1" size="xl">Donor Demographics Report</Heading>
      </Flex>
      
      <Text color="gray.600" mb={6}>
        Age, gender, and blood type distribution of blood donors.
      </Text>
      
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
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6} mb={8}>
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="md">Total Registered Donors</StatLabel>
                  <StatNumber fontSize="3xl" color="blue.500">{demographicsData.totalDonors.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    {(demographicsData.newDonorsThisMonth / demographicsData.totalDonors * 100).toFixed(1)}% this month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="md">New Donors (This Month)</StatLabel>
                  <StatNumber fontSize="3xl" color="green.500">{demographicsData.newDonorsThisMonth}</StatNumber>
                  <StatHelpText>+12% from last month</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="md">Active Donors</StatLabel>
                  <StatNumber fontSize="3xl" color="purple.500">{demographicsData.activeDonors.toLocaleString()}</StatNumber>
                  <StatHelpText>
                    {(demographicsData.activeDonors / demographicsData.totalDonors * 100).toFixed(1)}% of total donors
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardBody>
                <Stat>
                  <StatLabel fontSize="md">Avg. Donations per Donor</StatLabel>
                  <StatNumber fontSize="3xl" color="orange.500">{demographicsData.avgDonationsPerDonor}</StatNumber>
                  <StatHelpText>Lifetime average</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Gender Distribution</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Gender</Th>
                      <Th isNumeric>Count</Th>
                      <Th isNumeric>Percentage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {demographicsData.genderDistribution.map((item, index) => (
                      <Tr key={index}>
                        <Td>{item.gender}</Td>
                        <Td isNumeric>{item.count.toLocaleString()}</Td>
                        <Td isNumeric>{item.percentage}%</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                
                <Box 
                  mt={4} 
                  height="24px" 
                  width="100%" 
                  borderRadius="md" 
                  overflow="hidden" 
                  display="flex"
                >
                  {demographicsData.genderDistribution.map((item, index) => (
                    <Box 
                      key={index}
                      height="100%" 
                      width={`${item.percentage}%`}
                      bg={index === 0 ? 'blue.400' : index === 1 ? 'pink.400' : 'purple.400'}
                    />
                  ))}
                </Box>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Age Distribution</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Age Group</Th>
                      <Th isNumeric>Count</Th>
                      <Th isNumeric>Percentage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {demographicsData.ageDistribution.map((item, index) => (
                      <Tr key={index}>
                        <Td>{item.ageGroup}</Td>
                        <Td isNumeric>{item.count.toLocaleString()}</Td>
                        <Td isNumeric>{item.percentage}%</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                
                <Box mt={4}>
                  {demographicsData.ageDistribution.map((item, index) => (
                    <Flex key={index} align="center" mb={1}>
                      <Text width="60px" fontSize="sm">{item.ageGroup}</Text>
                      <Box
                        height="16px"
                        width={`${item.percentage}%`}
                        bg="green.400"
                        borderRadius="sm"
                        mr={2}
                      />
                      <Text fontSize="sm">{item.percentage}%</Text>
                    </Flex>
                  ))}
                </Box>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Blood Type Distribution</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <SimpleGrid columns={4} spacing={4} mb={4}>
                  {demographicsData.bloodTypeDistribution.map((item, index) => (
                    <Box 
                      key={index} 
                      bg={useColorModeValue('gray.100', 'gray.700')} 
                      p={3} 
                      borderRadius="md"
                      textAlign="center"
                    >
                      <Text fontWeight="bold" color="red.500" fontSize="xl">{item.bloodType}</Text>
                      <Text fontSize="sm">{item.percentage}%</Text>
                      <Text fontSize="xs" color="gray.500">({item.count} donors)</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
            
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Donor Frequency</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Donation History</Th>
                      <Th isNumeric>Count</Th>
                      <Th isNumeric>Percentage</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {demographicsData.donorFrequency.map((item, index) => (
                      <Tr key={index}>
                        <Td>{item.frequency}</Td>
                        <Td isNumeric>{item.count.toLocaleString()}</Td>
                        <Td isNumeric>{item.percentage}%</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                
                <Box mt={4}>
                  {demographicsData.donorFrequency.map((item, index) => (
                    <Flex key={index} align="center" mb={1}>
                      <Box
                        height="16px"
                        width={`${item.percentage}%`}
                        bg={
                          index === 0 ? 'blue.300' : 
                          index === 1 ? 'blue.500' : 
                          index === 2 ? 'blue.700' : 
                          'blue.900'
                        }
                        borderRadius="sm"
                        mr={2}
                      />
                      <Text fontSize="sm">{item.frequency} ({item.percentage}%)</Text>
                    </Flex>
                  ))}
                </Box>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          <Card bg={bgColor} boxShadow="md" mb={6}>
            <CardHeader>
              <Heading size="md">Geographic Distribution</Heading>
            </CardHeader>
            <Divider />
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <Box>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Location</Th>
                        <Th isNumeric>Count</Th>
                        <Th isNumeric>Percentage</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {demographicsData.locationData.map((item, index) => (
                        <Tr key={index}>
                          <Td><Flex align="center"><Icon as={FiMapPin} mr={2} />{item.location}</Flex></Td>
                          <Td isNumeric>{item.count.toLocaleString()}</Td>
                          <Td isNumeric>{item.percentage}%</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
                
                <Box>
                  {demographicsData.locationData.map((item, index) => (
                    <Flex key={index} align="center" mb={3}>
                      <Text width="150px" fontSize="sm" isTruncated>{item.location}</Text>
                      <Box flex="1">
                        <Box
                          height="20px"
                          width={`${item.percentage}%`}
                          bg={`teal.${500 - (index * 100)}`}
                          borderRadius="sm"
                        />
                      </Box>
                      <Text ml={2} fontSize="sm">{item.percentage}%</Text>
                    </Flex>
                  ))}
                </Box>
              </SimpleGrid>
            </CardBody>
          </Card>
          
          <Flex justify="space-between" mt={8}>
            <Text fontSize="sm" color="gray.500">
              Report generated: June 17, 2023
            </Text>
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                leftIcon={<FiDownload />}
              >
                Download PDF
              </Button>
              <Button
                colorScheme="green"
                leftIcon={<FiDownload />}
                variant="outline"
              >
                Export Excel
              </Button>
            </HStack>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default DonorDemographicsReport;