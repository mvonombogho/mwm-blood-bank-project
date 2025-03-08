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
import BloodRequestsView from '@/components/recipients/BloodRequestsView';
import TransfusionRecordView from '@/components/recipients/TransfusionRecordView';

const RecipientDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [recipient, setRecipient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (id) {
      fetchRecipient();
    }
  }, [id]);

  const fetchRecipient = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recipients/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipient details');
      }
      const data = await response.json();
      setRecipient(data.data);
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
    router.push(`/recipients/edit/${id}`);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <Badge colorScheme="green">{status}</Badge>;
      case 'Inactive':
        return <Badge colorScheme="yellow">{status}</Badge>;
      case 'Deceased':
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
          onClick={() => router.push('/recipients')}
          mr={4}
        >
          Back to List
        </Button>
        
        {recipient && (
          <Flex justify="space-between" flex="1" alignItems="center">
            <Box>
              <Heading size="lg">
                {recipient.firstName} {recipient.lastName}
              </Heading>
              <Flex mt={1} alignItems="center" gap={2}>
                <Text color="gray.600">{recipient.recipientId}</Text>
                <Badge colorScheme={recipient.bloodType.includes('-') ? 'purple' : 'red'}>
                  {recipient.bloodType}
                </Badge>
                {getStatusBadge(recipient.status)}
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
      ) : recipient ? (
        <Tabs colorScheme="blue">
          <TabList>
            <Tab>Blood Requests</Tab>
            <Tab>Transfusion Records</Tab>
            <Tab>Medical History</Tab>
            <Tab>Personal Info</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <BloodRequestsView recipientId={id} />
            </TabPanel>
            <TabPanel>
              <TransfusionRecordView recipientId={id} />
            </TabPanel>
            <TabPanel>
              <Box p={4}>
                <Heading size="md" mb={4}>Medical History</Heading>
                {recipient.medicalHistory ? (
                  <Box>
                    <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                      <GridItem>
                        <Box p={4} bg="gray.50" borderRadius="md">
                          <Heading size="sm" mb={3}>Blood Transfusion History</Heading>
                          <Text>
                            {recipient.medicalHistory.bloodTransfusionHistory ? 
                              'Previous transfusions received' : 
                              'No prior blood transfusions'}
                          </Text>
                        </Box>
                      </GridItem>
                      <GridItem>
                        <Box p={4} bg="gray.50" borderRadius="md">
                          <Heading size="sm" mb={3}>Allergies</Heading>
                          {recipient.medicalHistory.allergies && 
                           recipient.medicalHistory.allergies.length > 0 ? (
                            <Box>
                              {recipient.medicalHistory.allergies.map((allergy, index) => (
                                <Badge key={index} m={1} colorScheme="red">{allergy}</Badge>
                              ))}
                            </Box>
                          ) : (
                            <Text>No known allergies</Text>
                          )}
                        </Box>
                      </GridItem>
                      <GridItem colSpan={2}>
                        <Box p={4} bg="gray.50" borderRadius="md">
                          <Heading size="sm" mb={3}>Current Medications</Heading>
                          {recipient.medicalHistory.currentMedications && 
                           recipient.medicalHistory.currentMedications.length > 0 ? (
                            <Box>
                              {recipient.medicalHistory.currentMedications.map((med, index) => (
                                <Box key={index} mb={2}>
                                  <Text fontWeight="bold">{med.medication}</Text>
                                  <Text fontSize="sm">Dosage: {med.dosage}, Frequency: {med.frequency}</Text>
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Text>No current medications</Text>
                          )}
                        </Box>
                      </GridItem>
                    </Grid>
                  </Box>
                ) : (
                  <Text color="gray.500">No medical history recorded for this recipient.</Text>
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
                        <Text>{recipient.recipientId}</Text>
                        
                        <Text fontWeight="bold">Full Name:</Text>
                        <Text>{recipient.firstName} {recipient.lastName}</Text>
                        
                        <Text fontWeight="bold">Gender:</Text>
                        <Text>{recipient.gender}</Text>
                        
                        <Text fontWeight="bold">Date of Birth:</Text>
                        <Text>{new Date(recipient.dateOfBirth).toLocaleDateString()}</Text>
                        
                        <Text fontWeight="bold">Blood Type:</Text>
                        <Badge colorScheme={recipient.bloodType.includes('-') ? 'purple' : 'red'}>
                          {recipient.bloodType}
                        </Badge>
                        
                        <Text fontWeight="bold">Status:</Text>
                        {getStatusBadge(recipient.status)}
                        
                        <Text fontWeight="bold">Registered:</Text>
                        <Text>{new Date(recipient.registrationDate).toLocaleDateString()}</Text>
                      </Grid>
                    </Box>
                    
                    <Divider mb={6} />
                    
                    <Box>
                      <Heading size="sm" mb={3}>Transfusion Statistics</Heading>
                      <Grid templateColumns="180px 1fr" gap={2}>
                        <Text fontWeight="bold">Total Transfusions:</Text>
                        <Text>{recipient.transfusionCount || 0}</Text>
                        
                        <Text fontWeight="bold">Last Transfusion:</Text>
                        <Text>
                          {recipient.lastTransfusionDate 
                            ? new Date(recipient.lastTransfusionDate).toLocaleDateString() 
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
                        <Text>{recipient.email || 'Not provided'}</Text>
                        
                        <Text fontWeight="bold">Phone:</Text>
                        <Text>{recipient.phone}</Text>
                      </Grid>
                    </Box>
                    
                    <Divider mb={6} />
                    
                    <Box mb={6}>
                      <Heading size="sm" mb={3}>Address</Heading>
                      <Grid templateColumns="120px 1fr" gap={2}>
                        <Text fontWeight="bold">Street:</Text>
                        <Text>{recipient.address.street}</Text>
                        
                        <Text fontWeight="bold">City:</Text>
                        <Text>{recipient.address.city}</Text>
                        
                        <Text fontWeight="bold">State:</Text>
                        <Text>{recipient.address.state}</Text>
                        
                        <Text fontWeight="bold">Zip Code:</Text>
                        <Text>{recipient.address.zipCode}</Text>
                        
                        <Text fontWeight="bold">Country:</Text>
                        <Text>{recipient.address.country}</Text>
                      </Grid>
                    </Box>
                    
                    <Divider mb={6} />
                    
                    <Box>
                      <Heading size="sm" mb={3}>Emergency Contact</Heading>
                      <Grid templateColumns="120px 1fr" gap={2}>
                        <Text fontWeight="bold">Name:</Text>
                        <Text>{recipient.emergencyContact.name}</Text>
                        
                        <Text fontWeight="bold">Relationship:</Text>
                        <Text>{recipient.emergencyContact.relationship}</Text>
                        
                        <Text fontWeight="bold">Phone:</Text>
                        <Text>{recipient.emergencyContact.phone}</Text>
                      </Grid>
                    </Box>
                  </GridItem>
                </Grid>
                
                {recipient.notes && (
                  <Box mt={6}>
                    <Heading size="sm" mb={3}>Notes</Heading>
                    <Box p={4} bg="gray.50" borderRadius="md">
                      <Text>{recipient.notes}</Text>
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

export default RecipientDetailsPage;