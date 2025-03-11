import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  SkeletonText,
  Stack,
} from '@chakra-ui/react';
import { EditIcon, AddIcon, ViewIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import axios from 'axios';
import NextLink from 'next/link';

const DonorDetail = ({ donorId }) => {
  const toast = useToast();
  const router = useRouter();
  const [donor, setDonor] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setLoading(true);
        const [donorResponse, donationsResponse] = await Promise.all([
          axios.get(`/api/donors/${donorId}`),
          axios.get(`/api/donors/${donorId}/donations`)
        ]);
        
        setDonor(donorResponse.data);
        setDonations(donationsResponse.data);
      } catch (err) {
        console.error('Error fetching donor data:', err);
        setError(err.response?.data?.message || 'Failed to load donor information');
        toast({
          title: 'Error',
          description: 'Failed to load donor information',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (donorId) {
      fetchDonorData();
    }
  }, [donorId, toast]);

  const handleEditDonor = () => {
    router.push(`/donors/${donorId}/edit`);
  };

  const handleAddDonation = () => {
    router.push(`/donations/add?donorId=${donorId}`);
  };

  // Function to get color scheme for status badge
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'deferred': return 'orange';
      case 'ineligible': return 'red';
      default: return 'gray';
    }
  };

  if (error) {
    return (
      <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Error Loading Donor Information
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          {error}
        </AlertDescription>
        <Button mt={4} onClick={() => router.push('/donors')}>
          Back to Donors
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Skeleton isLoaded={!loading} fitContent>
          <Heading size="lg">
            {donor ? `${donor.firstName} ${donor.lastName}` : 'Donor Information'}
            {donor?.donorId && <Text as="span" fontSize="md" fontWeight="normal" ml={2} color="gray.500">ID: {donor.donorId}</Text>}
          </Heading>
        </Skeleton>
        
        <Flex>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="green"
            mr={3}
            onClick={handleAddDonation}
            isDisabled={loading || !donor || donor.status !== 'active'}
          >
            Add Donation
          </Button>
          <Button
            leftIcon={<EditIcon />}
            onClick={handleEditDonor}
            isDisabled={loading || !donor}
          >
            Edit Donor
          </Button>
        </Flex>
      </Flex>

      <Tabs colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>Overview</Tab>
          <Tab>Donation History</Tab>
          <Tab>Health Information</Tab>
          <Tab>Contact Details</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Basic Information</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Name</Text>
                          <Text>{donor?.firstName} {donor?.lastName}</Text>
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Status</Text>
                          {donor && (
                            <Badge colorScheme={getStatusColor(donor.status)} px={2} py={1}>
                              {donor.status}
                            </Badge>
                          )}
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Blood Type</Text>
                          {donor?.bloodType && (
                            <Badge colorScheme="red" px={2} py={1}>
                              {donor.bloodType}
                            </Badge>
                          )}
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Date of Birth</Text>
                          <Text>{donor?.dateOfBirth ? new Date(donor.dateOfBirth).toLocaleDateString() : '-'}</Text>
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Gender</Text>
                          <Text>{donor?.gender ? donor.gender.charAt(0).toUpperCase() + donor.gender.slice(1) : '-'}</Text>
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Occupation</Text>
                          <Text>{donor?.occupation || '-'}</Text>
                        </Box>
                      </Skeleton>
                    </Grid>
                  </CardBody>
                </Card>
                
                <Card mt={6}>
                  <CardHeader>
                    <Heading size="md">Donation Stats</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Skeleton isLoaded={!loading}>
                      <StatGroup>
                        <Stat>
                          <StatLabel>Total Donations</StatLabel>
                          <StatNumber>{donations?.length || 0}</StatNumber>
                        </Stat>
                        
                        <Stat>
                          <StatLabel>Last Donation</StatLabel>
                          <StatNumber>{donor?.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Never'}</StatNumber>
                        </Stat>
                        
                        <Stat>
                          <StatLabel>Total Volume Donated</StatLabel>
                          <StatNumber>
                            {donations?.reduce((total, donation) => total + (donation.volume || 0), 0) || 0} mL
                          </StatNumber>
                        </Stat>
                      </StatGroup>
                    </Skeleton>
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Eligibility Status</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Skeleton isLoaded={!loading}>
                      {donor?.status === 'active' ? (
                        <Alert status="success" borderRadius="md">
                          <AlertIcon />
                          This donor is eligible to donate
                        </Alert>
                      ) : donor?.status === 'pending' ? (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          This donor's eligibility is pending review
                        </Alert>
                      ) : donor?.status === 'deferred' ? (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          This donor is temporarily deferred from donating
                        </Alert>
                      ) : (
                        <Alert status="error" borderRadius="md">
                          <AlertIcon />
                          This donor is ineligible to donate
                        </Alert>
                      )}
                    </Skeleton>
                  </CardBody>
                </Card>
                
                <Card mt={6}>
                  <CardHeader>
                    <Heading size="md">Quick Contact</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Stack spacing={3}>
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Email</Text>
                          <Text>{donor?.email || '-'}</Text>
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Phone</Text>
                          <Text>{donor?.phone || '-'}</Text>
                        </Box>
                      </Skeleton>
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
          
          {/* Donation History Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Donation History</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <Skeleton isLoaded={!loading}>
                  {donations && donations.length > 0 ? (
                    <Box overflowX="auto">
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Date</Th>
                            <Th>Donation ID</Th>
                            <Th>Volume (mL)</Th>
                            <Th>Hemoglobin</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {donations.map((donation) => (
                            <Tr key={donation._id}>
                              <Td>{new Date(donation.donationDate).toLocaleDateString()}</Td>
                              <Td>{donation.donationId}</Td>
                              <Td>{donation.volume} mL</Td>
                              <Td>{donation.hemoglobin || 'N/A'}</Td>
                              <Td>
                                <Badge colorScheme={donation.status === 'completed' ? 'green' : donation.status === 'processing' ? 'blue' : 'yellow'}>
                                  {donation.status}
                                </Badge>
                              </Td>
                              <Td>
                                <IconButton
                                  icon={<ViewIcon />}
                                  aria-label="View donation"
                                  size="sm"
                                  onClick={() => router.push(`/donations/${donation._id}`)}
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      No donation history found for this donor.
                    </Alert>
                  )}
                </Skeleton>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Health Information Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Physical Information</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Weight</Text>
                          <Text>{donor?.weight ? `${donor.weight} kg` : 'Not recorded'}</Text>
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Height</Text>
                          <Text>{donor?.height ? `${donor.height} cm` : 'Not recorded'}</Text>
                        </Box>
                      </Skeleton>
                    </Grid>
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Previous Donations</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Skeleton isLoaded={!loading}>
                      <Box>
                        <Text fontWeight="bold" color="gray.500">Has Previous Donations</Text>
                        <Text>{donor?.hasPreviousDonation ? 'Yes' : 'No'}</Text>
                        {donor?.hasPreviousDonation && donor?.previousDonationDetails && (
                          <Box mt={2}>
                            <Text fontWeight="bold" color="gray.500">Details</Text>
                            <Text>{donor.previousDonationDetails}</Text>
                          </Box>
                        )}
                      </Box>
                    </Skeleton>
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem colSpan={{ base: 1, md: 2 }}>
                <Card>
                  <CardHeader>
                    <Heading size="md">Medical History</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Recent Illness</Text>
                          <Text>{donor?.hasRecentIllness ? 'Yes' : 'No'}</Text>
                          {donor?.hasRecentIllness && donor?.recentIllnessDetails && (
                            <Box mt={2}>
                              <Text fontWeight="bold" color="gray.500">Details</Text>
                              <Text>{donor.recentIllnessDetails}</Text>
                            </Box>
                          )}
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Chronic Disease</Text>
                          <Text>{donor?.hasChronicDisease ? 'Yes' : 'No'}</Text>
                          {donor?.hasChronicDisease && donor?.chronicDiseaseDetails && (
                            <Box mt={2}>
                              <Text fontWeight="bold" color="gray.500">Details</Text>
                              <Text>{donor.chronicDiseaseDetails}</Text>
                            </Box>
                          )}
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Current Medications</Text>
                          <Text>{donor?.isTakingMedication ? 'Yes' : 'No'}</Text>
                          {donor?.isTakingMedication && donor?.medicationDetails && (
                            <Box mt={2}>
                              <Text fontWeight="bold" color="gray.500">Details</Text>
                              <Text>{donor.medicationDetails}</Text>
                            </Box>
                          )}
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Recent Travel</Text>
                          <Text>{donor?.hasTraveledRecently ? 'Yes' : 'No'}</Text>
                          {donor?.hasTraveledRecently && donor?.travelDetails && (
                            <Box mt={2}>
                              <Text fontWeight="bold" color="gray.500">Details</Text>
                              <Text>{donor.travelDetails}</Text>
                            </Box>
                          )}
                        </Box>
                      </Skeleton>
                    </Grid>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
          
          {/* Contact Details Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Contact Information</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Email</Text>
                          <Text>{donor?.email || 'Not provided'}</Text>
                        </Box>
                      </Skeleton>
                      
                      <Skeleton isLoaded={!loading}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Phone</Text>
                          <Text>{donor?.phone || 'Not provided'}</Text>
                        </Box>
                      </Skeleton>
                    </Grid>
                  </CardBody>
                </Card>
                
                <Card mt={6}>
                  <CardHeader>
                    <Heading size="md">Address</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Skeleton isLoaded={!loading}>
                      <Box>
                        <Text fontWeight="bold" color="gray.500">Street Address</Text>
                        <Text>{donor?.address || 'Not provided'}</Text>
                      </Box>
                      
                      <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={4}>
                        <Box>
                          <Text fontWeight="bold" color="gray.500">City</Text>
                          <Text>{donor?.city || 'Not provided'}</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" color="gray.500">State/Province</Text>
                          <Text>{donor?.state || 'Not provided'}</Text>
                        </Box>
                        
                        <Box>
                          <Text fontWeight="bold" color="gray.500">Postal Code</Text>
                          <Text>{donor?.postalCode || 'Not provided'}</Text>
                        </Box>
                      </Grid>
                    </Skeleton>
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="md">Emergency Contact</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Skeleton isLoaded={!loading}>
                      {(donor?.emergencyContactName || donor?.emergencyContactPhone) ? (
                        <Stack spacing={4}>
                          <Box>
                            <Text fontWeight="bold" color="gray.500">Name</Text>
                            <Text>{donor?.emergencyContactName || 'Not provided'}</Text>
                          </Box>
                          
                          <Box>
                            <Text fontWeight="bold" color="gray.500">Phone</Text>
                            <Text>{donor?.emergencyContactPhone || 'Not provided'}</Text>
                          </Box>
                          
                          <Box>
                            <Text fontWeight="bold" color="gray.500">Relationship</Text>
                            <Text>{donor?.emergencyContactRelationship || 'Not provided'}</Text>
                          </Box>
                        </Stack>
                      ) : (
                        <Alert status="info">
                          <AlertIcon />
                          No emergency contact information provided.
                        </Alert>
                      )}
                    </Skeleton>
                  </CardBody>
                </Card>
                
                <Card mt={6}>
                  <CardHeader>
                    <Heading size="md">Consent Information</Heading>
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Skeleton isLoaded={!loading}>
                      <Box>
                        <Text fontWeight="bold" color="gray.500">Has Consented to Donate</Text>
                        <Badge colorScheme={donor?.hasConsented ? 'green' : 'red'} py={1} px={2}>
                          {donor?.hasConsented ? 'Yes' : 'No'}
                        </Badge>
                      </Box>
                    </Skeleton>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default DonorDetail;
