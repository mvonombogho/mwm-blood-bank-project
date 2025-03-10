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
      const response = await fetch(`/api/donors/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch donor details');
      }
      const data = await response.json();
      setDonor(data.data);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
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
                <Badge colorScheme={donor.bloodType?.includes('-') ? 'purple' : 'red'}>
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
            <Tab>Medical History</Tab>
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
                <Heading size="md" mb={4}>Medical History</Heading>
                {donor.medicalHistory ? (
                  <Box>
                    <Text>Coming soon: Detailed medical history view.</Text>
                  </Box>
                ) : (
                  <Text color="gray.500">No medical history recorded for this donor.</Text>
                )}
              </Box>
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
                        <Text>{new Date(donor.dateOfBirth).toLocaleDateString()}</Text>
                        
                        <Text fontWeight="bold">Blood Type:</Text>
                        <Badge colorScheme={donor.bloodType?.includes('-') ? 'purple' : 'red'}>
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
                            : 'None'}
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
                        
                        <Text fontWeight="bold">Contact Preferences:</Text>
                        <Flex gap={2} wrap="wrap">
                          {donor.communicationPreferences?.email && <Badge colorScheme="blue">Email</Badge>}
                          {donor.communicationPreferences?.sms && <Badge colorScheme="green">SMS</Badge>}
                          {donor.communicationPreferences?.phone && <Badge colorScheme="orange">Phone</Badge>}
                          {donor.communicationPreferences?.post && <Badge colorScheme="purple">Post</Badge>}
                        </Flex>
                      </Grid>
                    </Box>
                    
                    <Divider mb={6} />
                    
                    <Box mb={6}>
                      <Heading size="sm" mb={3}>Address</Heading>
                      <Grid templateColumns="120px 1fr" gap={2}>
                        <Text fontWeight="bold">Street:</Text>
                        <Text>{donor.address?.street}</Text>
                        
                        <Text fontWeight="bold">City:</Text>
                        <Text>{donor.address?.city}</Text>
                        
                        <Text fontWeight="bold">State:</Text>
                        <Text>{donor.address?.state}</Text>
                        
                        <Text fontWeight="bold">Zip Code:</Text>
                        <Text>{donor.address?.zipCode}</Text>
                        
                        <Text fontWeight="bold">Country:</Text>
                        <Text>{donor.address?.country}</Text>
                      </Grid>
                    </Box>
                    
                    <Divider mb={6} />
                    
                    <Box>
                      <Heading size="sm" mb={3}>Emergency Contact</Heading>
                      <Grid templateColumns="120px 1fr" gap={2}>
                        <Text fontWeight="bold">Name:</Text>
                        <Text>{donor.emergencyContact?.name}</Text>
                        
                        <Text fontWeight="bold">Relationship:</Text>
                        <Text>{donor.emergencyContact?.relationship}</Text>
                        
                        <Text fontWeight="bold">Phone:</Text>
                        <Text>{donor.emergencyContact?.phone}</Text>
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