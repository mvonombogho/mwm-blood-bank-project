import { useState, useEffect } from 'react';
import {
  Box, Heading, Button, Table, Thead, Tbody, Tr, Th, Td,
  Badge, IconButton, Menu, MenuButton, MenuList, MenuItem,
  useToast, Spinner, Flex, HStack, Input, InputGroup,
  InputLeftElement, Select, Text, useDisclosure, SimpleGrid,
  Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Card,
  CardBody, useColorModeValue, Tabs, TabList, TabPanels,
  Tab, TabPanel
} from '@chakra-ui/react';
import {
  FaPlus, FaSearch, FaEllipsisV, FaEdit, FaEye, FaUserClock,
  FaUserCheck, FaUserTimes, FaUser, FaSyringe, FaCalendarAlt
} from 'react-icons/fa';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/auth/AuthGuard';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';

const DonorsPage = () => {
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('');
  const [filterEligibility, setFilterEligibility] = useState('');
  const toast = useToast();
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // This would be replaced with actual API calls in a real app
  useEffect(() => {
    const fetchDonors = async () => {
      setIsLoading(true);
      try {
        // Simulate API call with mock data
        setTimeout(() => {
          const mockDonors = [
            {
              _id: 'D10001',
              name: 'John Smith',
              email: 'john.smith@example.com',
              phone: '+254712345678',
              bloodType: 'O+',
              eligibility: 'eligible',
              lastDonation: '2025-01-15',
              nextEligibleDate: '2025-04-15',
              totalDonations: 8,
              address: 'Nairobi, Kenya',
              status: 'active',
              registrationDate: '2022-05-10'
            },
            {
              _id: 'D10002',
              name: 'Mary Johnson',
              email: 'mary.j@example.com',
              phone: '+254723456789',
              bloodType: 'A-',
              eligibility: 'ineligible',
              lastDonation: '2025-02-20',
              nextEligibleDate: '2025-05-20',
              totalDonations: 3,
              address: 'Mombasa, Kenya',
              status: 'active',
              registrationDate: '2023-01-15',
              deferralReason: 'Low hemoglobin'
            },
            {
              _id: 'D10003',
              name: 'David Kamau',
              email: 'david.k@example.com',
              phone: '+254734567890',
              bloodType: 'B+',
              eligibility: 'eligible',
              lastDonation: '2024-09-05',
              nextEligibleDate: '2025-02-03',
              totalDonations: 12,
              address: 'Nakuru, Kenya',
              status: 'active',
              registrationDate: '2021-08-22'
            },
            {
              _id: 'D10004',
              name: 'Sarah Wanjiku',
              email: 'sarah.w@example.com',
              phone: '+254745678901',
              bloodType: 'AB+',
              eligibility: 'eligible',
              lastDonation: '2024-11-30',
              nextEligibleDate: '2025-02-28',
              totalDonations: 6,
              address: 'Kisumu, Kenya',
              status: 'active',
              registrationDate: '2022-10-05'
            },
            {
              _id: 'D10005',
              name: 'Michael Omondi',
              email: 'michael.o@example.com',
              phone: '+254756789012',
              bloodType: 'O-',
              eligibility: 'deferred',
              lastDonation: '2024-10-15',
              nextEligibleDate: '2025-07-15',
              totalDonations: 4,
              address: 'Eldoret, Kenya',
              status: 'active',
              registrationDate: '2023-03-17',
              deferralReason: 'Recent travel to malaria zone',
              deferralDate: '2025-01-15',
              deferralExpiry: '2025-07-15'
            }
          ];
          
          setDonors(mockDonors);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching donors:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch donors',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    };
    
    fetchDonors();
  }, [toast]);
  
  // Summary statistics
  const donorStats = {
    totalDonors: donors.length,
    activeDonors: donors.filter(d => d.status === 'active').length,
    eligibleDonors: donors.filter(d => d.eligibility === 'eligible').length,
    deferredDonors: donors.filter(d => d.eligibility === 'deferred').length,
    ineligibleDonors: donors.filter(d => d.eligibility === 'ineligible').length,
    bloodTypeDistribution: {}
  };
  
  // Calculate blood type distribution
  donors.forEach(donor => {
    if (!donorStats.bloodTypeDistribution[donor.bloodType]) {
      donorStats.bloodTypeDistribution[donor.bloodType] = 0;
    }
    donorStats.bloodTypeDistribution[donor.bloodType]++;
  });
  
  // Filter donors based on search and filters
  const filteredDonors = donors.filter(donor => {
    const matchesSearch = 
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone.includes(searchTerm);
      
    const matchesStatus = filterStatus ? donor.status === filterStatus : true;
    const matchesBloodType = filterBloodType ? donor.bloodType === filterBloodType : true;
    const matchesEligibility = filterEligibility ? donor.eligibility === filterEligibility : true;
    
    return matchesSearch && matchesStatus && matchesBloodType && matchesEligibility;
  });
  
  // Get badge color for eligibility
  const getEligibilityColor = (eligibility) => {
    switch (eligibility) {
      case 'eligible': return 'green';
      case 'ineligible': return 'red';
      case 'deferred': return 'yellow';
      default: return 'gray';
    }
  };
  
  // Get badge color for blood type
  const getBloodTypeColor = (bloodType) => {
    if (bloodType.includes('O')) return 'red';
    if (bloodType.includes('A')) return 'blue';
    if (bloodType.includes('B')) return 'green';
    if (bloodType.includes('AB')) return 'purple';
    return 'gray';
  };
  
  const StatCard = ({ title, value, icon, color, subvalue }) => {
    const Icon = icon;
    return (
      <Card bg={cardBg}>
        <CardBody>
          <Flex justify="space-between">
            <Box>
              <StatLabel color="gray.500">{title}</StatLabel>
              <StatNumber color={`${color}.500`}>{value}</StatNumber>
              {subvalue && <StatHelpText>{subvalue}</StatHelpText>}
            </Box>
            <Flex
              w={12}
              h={12}
              align="center"
              justify="center"
              rounded="full"
              bg={`${color}.100`}
            >
              <Icon color={`${color}.500`} size="24px" />
            </Flex>
          </Flex>
        </CardBody>
      </Card>
    );
  };
  
  return (
    <AuthGuard requiredPermissions={{ canManageDonors: true }}>
      <Layout title="Donor Management">
        <Box maxW="7xl" mx="auto">
          <Flex justify="space-between" align="center" mb={6}>
            <Heading as="h1" size="xl">Donor Management</Heading>
            
            <NextLink href="/donors/add" passHref>
              <Button as="a" colorScheme="red" leftIcon={<FaPlus />}>
                Add New Donor
              </Button>
            </NextLink>
          </Flex>
          
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
            <StatCard 
              title="Total Donors"
              value={donorStats.totalDonors}
              icon={FaUser}
              color="blue"
            />
            <StatCard 
              title="Eligible Donors"
              value={donorStats.eligibleDonors}
              icon={FaUserCheck}
              color="green"
            />
            <StatCard 
              title="Deferred Donors"
              value={donorStats.deferredDonors}
              icon={FaUserClock}
              color="yellow"
            />
            <StatCard 
              title="Upcoming Donations"
              value={0}
              icon={FaCalendarAlt}
              color="purple"
              subvalue="Next 7 days"
            />
          </SimpleGrid>
          
          <Tabs colorScheme="red" mb={6}>
            <TabList>
              <Tab>All Donors</Tab>
              <Tab>Eligible</Tab>
              <Tab>Deferred</Tab>
              <Tab>Ineligible</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel px={0}>
                <Box>
                  <HStack mb={6} spacing={4}>
                    <InputGroup maxW="400px">
                      <InputLeftElement pointerEvents="none">
                        <FaSearch color="gray.300" />
                      </InputLeftElement>
                      <Input 
                        placeholder="Search by name, ID, email or phone" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                    
                    <Select 
                      placeholder="All Blood Types" 
                      value={filterBloodType}
                      onChange={(e) => setFilterBloodType(e.target.value)}
                      maxW="180px"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </Select>
                    
                    <Select 
                      placeholder="All Eligibility" 
                      value={filterEligibility}
                      onChange={(e) => setFilterEligibility(e.target.value)}
                      maxW="180px"
                    >
                      <option value="eligible">Eligible</option>
                      <option value="ineligible">Ineligible</option>
                      <option value="deferred">Deferred</option>
                    </Select>
                  </HStack>
                  
                  <Box 
                    bg={useColorModeValue('white', 'gray.800')} 
                    shadow="md" 
                    borderRadius="lg" 
                    overflow="hidden"
                  >
                    {isLoading ? (
                      <Flex justify="center" align="center" p={8}>
                        <Spinner size="xl" color="red.500" thickness="4px" />
                      </Flex>
                    ) : (
                      <Box overflowX="auto">
                        <Table variant="simple">
                          <Thead>
                            <Tr>
                              <Th>Donor ID</Th>
                              <Th>Name</Th>
                              <Th>Contact</Th>
                              <Th>Blood Type</Th>
                              <Th>Status</Th>
                              <Th>Last Donation</Th>
                              <Th>Next Eligible</Th>
                              <Th>Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredDonors.length > 0 ? (
                              filteredDonors.map((donor) => (
                                <Tr key={donor._id}>
                                  <Td fontWeight="medium">{donor._id}</Td>
                                  <Td>{donor.name}</Td>
                                  <Td>
                                    <Text fontSize="sm">{donor.email}</Text>
                                    <Text fontSize="sm" color="gray.600">{donor.phone}</Text>
                                  </Td>
                                  <Td>
                                    <Badge colorScheme={getBloodTypeColor(donor.bloodType)}>
                                      {donor.bloodType}
                                    </Badge>
                                  </Td>
                                  <Td>
                                    <Badge colorScheme={getEligibilityColor(donor.eligibility)}>
                                      {donor.eligibility.charAt(0).toUpperCase() + donor.eligibility.slice(1)}
                                    </Badge>
                                    {donor.deferralReason && (
                                      <Text fontSize="xs" color="gray.500" mt={1}>
                                        {donor.deferralReason}
                                      </Text>
                                    )}
                                  </Td>
                                  <Td>{donor.lastDonation}</Td>
                                  <Td>{donor.nextEligibleDate}</Td>
                                  <Td>
                                    <Menu>
                                      <MenuButton
                                        as={IconButton}
                                        icon={<FaEllipsisV />}
                                        variant="ghost"
                                        size="sm"
                                      />
                                      <MenuList>
                                        <NextLink href={`/donors/${donor._id}`} passHref>
                                          <MenuItem icon={<FaEye />}>
                                            View Profile
                                          </MenuItem>
                                        </NextLink>
                                        <NextLink href={`/donors/edit/${donor._id}`} passHref>
                                          <MenuItem icon={<FaEdit />}>
                                            Edit Donor
                                          </MenuItem>
                                        </NextLink>
                                        <NextLink href={`/donors/${donor._id}/donation`} passHref>
                                          <MenuItem icon={<FaSyringe />}>
                                            Record Donation
                                          </MenuItem>
                                        </NextLink>
                                      </MenuList>
                                    </Menu>
                                  </Td>
                                </Tr>
                              ))
                            ) : (
                              <Tr>
                                <Td colSpan={8} textAlign="center" py={4}>
                                  <Text>No donors found matching your criteria.</Text>
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </Box>
                    )}
                  </Box>
                </Box>
              </TabPanel>
              
              <TabPanel px={0}>
                <Box>Filtered view of Eligible donors</Box>
              </TabPanel>
              
              <TabPanel px={0}>
                <Box>Filtered view of Deferred donors</Box>
              </TabPanel>
              
              <TabPanel px={0}>
                <Box>Filtered view of Ineligible donors</Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Layout>
    </AuthGuard>
  );
};

export default DonorsPage;
