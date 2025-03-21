import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Stack,
  Divider,
  Badge,
  Spinner,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';
import React from 'react';

const DonorDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Alert dialog for delete confirmation
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  useEffect(() => {
    if (!id) return;
    
    const fetchDonor = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/donors/${id}`);
        setDonor(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching donor:', error);
        setError('Failed to load donor information');
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

    fetchDonor();
  }, [id, toast]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/donors/${id}`);
      
      toast({
        title: 'Donor deleted',
        description: 'Donor has been successfully removed',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      router.push('/donors');
    } catch (error) {
      console.error('Error deleting donor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete donor',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  };

  const getStatusBadge = (status) => {
    const statusProps = {
      active: { colorScheme: 'green', text: 'Active' },
      pending: { colorScheme: 'yellow', text: 'Pending' },
      deferred: { colorScheme: 'orange', text: 'Deferred' },
      ineligible: { colorScheme: 'red', text: 'Ineligible' },
    };
    
    const { colorScheme, text } = statusProps[status] || { colorScheme: 'gray', text: status };
    
    return (
      <Badge colorScheme={colorScheme} borderRadius="full" px={2}>
        {text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={6}>
        <Flex align="center" mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => router.push('/donors')}
            size="sm"
          >
            Back to Donors
          </Button>
        </Flex>
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Heading size="md" mt={4}>Loading donor information...</Heading>
        </Box>
      </Container>
    );
  }

  if (error || !donor) {
    return (
      <Container maxW="container.xl" py={6}>
        <Flex align="center" mb={6}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => router.push('/donors')}
            size="sm"
          >
            Back to Donors
          </Button>
        </Flex>
        <Box textAlign="center" py={10}>
          <Heading size="md" color="red.500">{error || 'Donor not found'}</Heading>
          <Button
            mt={4}
            colorScheme="blue"
            onClick={() => router.push('/donors')}
          >
            Return to Donors List
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Flex align="center" justify="space-between" mb={6}>
        <Button
          leftIcon={<ArrowBackIcon />}
          variant="ghost"
          onClick={() => router.push('/donors')}
          size="sm"
        >
          Back to Donors
        </Button>
        
        <Stack direction="row" spacing={2}>
          <Button
            leftIcon={<EditIcon />}
            colorScheme="blue"
            variant="outline"
            onClick={() => router.push(`/donors/edit/${id}`)}
          >
            Edit
          </Button>
          <Button
            leftIcon={<DeleteIcon />}
            colorScheme="red"
            variant="outline"
            onClick={onOpen}
          >
            Delete
          </Button>
        </Stack>
      </Flex>
      
      <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" bg="white">
        <Flex align="center" justify="space-between" mb={4}>
          <Heading size="lg">{donor.firstName} {donor.lastName}</Heading>
          <Box>{getStatusBadge(donor.status)}</Box>
        </Flex>
        
        <Text color="gray.600" fontWeight="medium" fontSize="sm" mb={6}>
          Donor ID: {donor.donorId || 'Not assigned'} | Registered: {formatDate(donor.createdAt)}
        </Text>
        
        <Divider mb={6} />
        
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          <GridItem>
            <Heading size="md" mb={4}>Personal Information</Heading>
            
            <Stack spacing={3}>
              <Flex>
                <Text fontWeight="bold" width="150px">Date of Birth:</Text>
                <Text>{formatDate(donor.dateOfBirth)}</Text>
              </Flex>
              
              <Flex>
                <Text fontWeight="bold" width="150px">Gender:</Text>
                <Text>{donor.gender?.charAt(0).toUpperCase() + donor.gender?.slice(1)}</Text>
              </Flex>
              
              <Flex>
                <Text fontWeight="bold" width="150px">Blood Type:</Text>
                <Text>{donor.bloodType}</Text>
              </Flex>
              
              <Flex>
                <Text fontWeight="bold" width="150px">Occupation:</Text>
                <Text>{donor.occupation || 'Not specified'}</Text>
              </Flex>
            </Stack>
          </GridItem>
          
          <GridItem>
            <Heading size="md" mb={4}>Contact Information</Heading>
            
            <Stack spacing={3}>
              <Flex>
                <Text fontWeight="bold" width="150px">Email:</Text>
                <Text>{donor.email}</Text>
              </Flex>
              
              <Flex>
                <Text fontWeight="bold" width="150px">Phone:</Text>
                <Text>{donor.phone}</Text>
              </Flex>
              
              <Flex>
                <Text fontWeight="bold" width="150px">Address:</Text>
                <Text>
                  {donor.address ? (
                    <>
                      {donor.address}<br />
                      {donor.city}{donor.state ? `, ${donor.state}` : ''} {donor.postalCode}
                    </>
                  ) : (
                    'Not specified'
                  )}
                </Text>
              </Flex>
            </Stack>
          </GridItem>
          
          {donor.emergencyContactName && (
            <GridItem>
              <Heading size="md" mb={4}>Emergency Contact</Heading>
              
              <Stack spacing={3}>
                <Flex>
                  <Text fontWeight="bold" width="150px">Name:</Text>
                  <Text>{donor.emergencyContactName}</Text>
                </Flex>
                
                <Flex>
                  <Text fontWeight="bold" width="150px">Phone:</Text>
                  <Text>{donor.emergencyContactPhone || 'Not specified'}</Text>
                </Flex>
                
                <Flex>
                  <Text fontWeight="bold" width="150px">Relationship:</Text>
                  <Text>{donor.emergencyContactRelationship || 'Not specified'}</Text>
                </Flex>
              </Stack>
            </GridItem>
          )}
          
          <GridItem>
            <Heading size="md" mb={4}>Health Information</Heading>
            
            <Stack spacing={3}>
              {donor.weight && (
                <Flex>
                  <Text fontWeight="bold" width="150px">Weight:</Text>
                  <Text>{donor.weight} kg</Text>
                </Flex>
              )}
              
              {donor.height && (
                <Flex>
                  <Text fontWeight="bold" width="150px">Height:</Text>
                  <Text>{donor.height} cm</Text>
                </Flex>
              )}
              
              {donor.hasRecentIllness && (
                <Flex>
                  <Text fontWeight="bold" width="150px">Recent Illness:</Text>
                  <Text>{donor.recentIllnessDetails || 'Yes'}</Text>
                </Flex>
              )}
              
              {donor.hasChronicDisease && (
                <Flex>
                  <Text fontWeight="bold" width="150px">Chronic Disease:</Text>
                  <Text>{donor.chronicDiseaseDetails || 'Yes'}</Text>
                </Flex>
              )}
              
              {donor.isTakingMedication && (
                <Flex>
                  <Text fontWeight="bold" width="150px">Medications:</Text>
                  <Text>{donor.medicationDetails || 'Yes'}</Text>
                </Flex>
              )}
              
              {donor.hasPreviousDonation && (
                <Flex>
                  <Text fontWeight="bold" width="150px">Previous Donation:</Text>
                  <Text>{donor.previousDonationDetails || 'Yes'}</Text>
                </Flex>
              )}
            </Stack>
          </GridItem>
        </Grid>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Donor
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {donor.firstName} {donor.lastName}? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default DonorDetailPage;