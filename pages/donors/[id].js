import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Heading,
  Flex,
  Button,
  Spinner,
  Text,
  useToast,
  Badge,
  Grid,
  GridItem,
  Divider
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon } from '@chakra-ui/icons';
import DonationHistoryView from '@/components/donors/DonationHistoryView';
import EligibilityCheckView from '@/components/donors/EligibilityCheckView';

const DonorDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (id) {
      fetchDonor();
    }
  }, [id]);

  const fetchDonor = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would be an API call to fetch donor details
      // For now, simulate with mock data
      
      const mockDonor = {
        _id: id,
        donorId: 'D230001',
        firstName: 'John',
        lastName: 'Doe',
        gender: 'Male',
        dateOfBirth: new Date('1985-06-15').toISOString(),
        bloodType: 'O+',
        email: 'john.doe@example.com',
        phone: '555-123-4567',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'ST',
          zipCode: '12345',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '555-987-6543'
        },
        status: 'Active',
        registrationDate: new Date('2022-01-10').toISOString(),
        lastDonationDate: new Date('2023-01-15').toISOString(),
        donationCount: 5,
        communicationPreferences: {
          email: true,
          sms: true,
          phone: true,
          post: false
        },
        notes: 'Regular donor with no adverse reactions to donations.'
      };
      
      // Simulate loading time
      setTimeout(() => {
        setDonor(mockDonor);
        setLoading(false);
      }, 500);
      
      // In a real implementation, this would be:
      // const response = await fetch(`/api/donors/${id}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch donor details');
      // }
      // const data = await response.json();
      // setDonor(data.data);
      // setLoading(false);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/donors/edit/${id}`);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <Badge colorScheme="green">{status}</Badge>;
      case 'Deferred':
        return <Badge colorScheme="orange">{status}</Badge>;
      case 'Inactive':
        return <Badge colorScheme="gray">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Box maxW="container.xl" mx="auto" py={6}>
      <Flex mb={6} alignItems="center">
        <Button 
          leftIcon={<ArrowBackIcon />} 
          variant="ghost" 
          onClick={() => router.push('/donors')}
          mr={4}
        >
          Back to List
        </Button>
        
        {donor && (
          <Flex justify="space-between" flex="1" alignItems="center">
            <Box>
              <Heading size="lg">
                {donor.firstName} {donor.lastName}
              </Heading>
              <Flex mt={1} alignItems="center" gap={2}>
                <Text color="gray.600">{donor.donorId}</Text>
                <Badge colorScheme={donor.bloodType.includes('-') ? 'purple' : 'red'}>
                  {donor.bloodType}
                </Badge>
                {getStatusBadge(donor.status)}
              </Flex>
            </Box>
            <Button
              leftIcon={<EditIcon />}
              colorScheme="blue"
              onClick={handleEdit}
            >
              Edit
            </Button>
          </Flex>
        )}
      </Flex>

      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Text color="red.500">Error: {error}</Text>
      ) : donor ? (
        <Tabs colorScheme="blue">
          <TabList>
            <Tab>Eligibility</Tab>
            <Tab>Donation History</Tab>
            <Tab>Personal Info</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <EligibilityCheckView donorId={id} />
            </TabPanel>
            <TabPanel>
              <DonationHistoryView donorId={id} />
            </TabPanel>
            <TabPanel>
              <Box p={4}>
                <Heading size="md" mb={4}>Personal Information</Heading>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  <GridItem>
                    <Box mb={6}>
                      <Heading size="sm" mb={3}>Basic Information</Heading>
                      <Grid templateColumns="120px 1fr" gap={2}>
                        <Text fontWeight="bold">ID:</Text>
                        <Text>{donor.donorId}</Text>
                        
                        <Text fontWeight="bold">Full Name:</Text>
                        <Text>{donor.firstName} {donor.lastName}</Text>
                        
                        <Text fontWeight="bold">Gender:</Text>
                        <Text>{donor.gender}</Text>
                        
                        <Text fontWeight="bold">Date of Birth:</Text>
                        <Text>{new Date(donor.dateOfBirth).toLocaleDateString()} ({calculateAge(donor.dateOfBirth)} years)</Text>
                        
                        <Text fontWeight="bold">Blood Type:</Text>
                        <Badge colorScheme={donor.bloodType.includes('-') ? 'purple' : 'red'}>
                          {donor.bloodType}
                        </Badge>
                        
                        <Text fontWeight="bold">Status:</Text>
                        {getStatusBadge(donor.status)}
                        
                        <Text fontWeight="bold">Registered:</Text>
                        <Text>{new Date(donor.registrationDate).toLocaleDateString()}</Text>
                      </Grid>
                    </Box>
                    
                    <Divider mb={6} />
                    
                    <Box>
                      <Heading size="sm" mb={3}>Donation Statistics</Heading>
                      <Grid templateColumns="180px 1fr" gap={2}>
                        <Text fontWeight="bold">Total Donations:</Text>
                        <Text>{donor.donationCount || 0}</Text>
                        
                        <Text fontWeight="bold">Last Donation:</Text>
                        <Text>
                          {donor.lastDonationDate 
                            ? new Date(donor.lastDonationDate).toLocaleDateString() 
                            : 'Never'
                          }
                        </Text>
                      </Grid>
                    </Box>
                  </GridItem>
                  
                  <GridItem>
                    <Box mb={6}>
                      <Heading size="sm" mb={3}>Contact Information</Heading>
                      <Grid templateColumns="120px 1fr" gap={2}>
                        <Text fontWeight="bold">Email:</Text>
                        <Text>{donor.email || 'Not provided'}</Text>
                        
                        <Text fontWeight="bold">Phone:</Text>
                        <Text>{donor.phone}</Text>
                      </Grid>
                    </Box>
                    
                    <Divider mb={6} />
                    
                    <Box mb={6}>
                      <Heading size="sm" mb={3}>Address</Heading>
                      <Grid templateColumns="120px 1fr" gap={2}>
                        <Text fontWeight="bold">Street:</Text>
                        <Text>{donor.address.street}</Text>
                        
                        <Text fontWeight="bold">City:</Text>
                        <Text>{donor.address.city}</Text>
                        
                        <Text fontWeight="bold">State:</Text>
                        <Text>{donor.address.state}</Text>
                        
                        <Text fontWeight="bold">Zip Code:</Text>
                        <Text>{donor.address.zipCode}</Text>
                        
                        <Text fontWeight="bold">Country:</Text>
                        <Text>{donor.address.country}</Text>
                      </Grid>
                    </Box>
                    
                    <Divider mb={6} />
                    
                    <Box>
                      <Heading size="sm" mb={3}>Emergency Contact</Heading>
                      <Grid templateColumns="120px 1fr" gap={2}>
                        <Text fontWeight="bold">Name:</Text>
                        <Text>{donor.emergencyContact.name}</Text>
                        
                        <Text fontWeight="bold">Relationship:</Text>
                        <Text>{donor.emergencyContact.relationship}</Text>
                        
                        <Text fontWeight="bold">Phone:</Text>
                        <Text>{donor.emergencyContact.phone}</Text>
                      </Grid>
                    </Box>
                  </GridItem>
                </Grid>
                
                {donor.notes && (
                  <Box mt={6}>
                    <Heading size="sm" mb={3}>Notes</Heading>
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <Text>{donor.notes}</Text>
                    </Box>
                  </Box>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      ) : null}
    </Box>
  );
};

export default DonorDetailsPage;