import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Badge,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Spinner,
  useToast,
  Select,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage
} from '@chakra-ui/react';
import { AddIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';

const DonationHistoryView = ({ donorId }) => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const toast = useToast();
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    if (donorId) {
      fetchDonations();
    }
  }, [donorId]);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      // This would be a real API call in a complete implementation
      // For now, simulate a fetch with mock data
      const mockDonations = [
        {
          donationId: 'BU230301001',
          date: new Date('2023-03-01').toISOString(),
          bloodType: 'O+',
          quantity: 450,
          location: 'Main Blood Center',
          status: 'Transfused',
          notes: 'Routine donation'
        },
        {
          donationId: 'BU221105002',
          date: new Date('2022-11-05').toISOString(),
          bloodType: 'O+',
          quantity: 450,
          location: 'Mobile Drive - City Hall',
          status: 'Transfused',
          notes: 'Mobile blood drive'
        },
        {
          donationId: 'BU220701003',
          date: new Date('2022-07-01').toISOString(),
          bloodType: 'O+',
          quantity: 450,
          location: 'Main Blood Center',
          status: 'Expired',
          notes: 'Routine donation'
        }
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setDonations(mockDonations);
        setIsLoading(false);
      }, 500);
      
      // In a real implementation, this would be:
      // const response = await fetch(`/api/donors/${donorId}/donations`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch donations');
      // }
      // const data = await response.json();
      // setDonations(data);
      // setIsLoading(false);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const handleViewDonation = (donation) => {
    setSelectedDonation(donation);
    onViewOpen();
  };

  const handleAddDonation = () => {
    setIsEditMode(false);
    setSelectedDonation(null);
    reset({
      bloodType: '',
      quantity: 450,
      date: new Date().toISOString().split('T')[0],
      location: '',
      notes: ''
    });
    onFormOpen();
  };

  const handleEditDonation = (donation) => {
    setIsEditMode(true);
    setSelectedDonation(donation);
    
    // Format date for form input
    const formattedDate = donation.date 
      ? new Date(donation.date).toISOString().split('T')[0]
      : '';
    
    reset({
      bloodType: donation.bloodType,
      quantity: donation.quantity,
      date: formattedDate,
      location: donation.location,
      notes: donation.notes
    });
    
    onFormOpen();
  };

  const onSubmit = async (data) => {
    try {
      // In a real implementation, we would make an API call to add/update a donation
      // For now, we'll simulate it by updating our local state
      
      if (isEditMode) {
        // Update existing donation
        const updatedDonations = donations.map(donation => 
          donation.donationId === selectedDonation.donationId
            ? { ...donation, ...data }
            : donation
        );
        setDonations(updatedDonations);
        
        toast({
          title: 'Donation Updated',
          description: 'Donation record has been updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Create new donation with a mock ID
        const newDonation = {
          donationId: `BU${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          date: data.date,
          bloodType: data.bloodType,
          quantity: data.quantity,
          location: data.location,
          status: 'Processing',
          notes: data.notes
        };
        
        setDonations([newDonation, ...donations]);
        
        toast({
          title: 'Donation Added',
          description: 'New donation record has been created',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Close the form modal
      onFormClose();
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Available':
        return <Badge colorScheme="green">{status}</Badge>;
      case 'Processing':
        return <Badge colorScheme="blue">{status}</Badge>;
      case 'Transfused':
        return <Badge colorScheme="purple">{status}</Badge>;
      case 'Expired':
        return <Badge colorScheme="orange">{status}</Badge>;
      case 'Discarded':
        return <Badge colorScheme="red">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="md">Donation History</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          size="sm"
          onClick={handleAddDonation}
        >
          Add Donation
        </Button>
      </Flex>
      
      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" height="100px">
          <Spinner />
        </Flex>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : donations.length === 0 ? (
        <Text color="gray.500">No donation records found for this donor.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Donation ID</Th>
                <Th>Date</Th>
                <Th>Blood Type</Th>
                <Th>Quantity</Th>
                <Th>Location</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {donations.map((donation) => (
                <Tr key={donation.donationId}>
                  <Td>{donation.donationId}</Td>
                  <Td>{new Date(donation.date).toLocaleDateString()}</Td>
                  <Td>
                    <Badge colorScheme={donation.bloodType.includes('-') ? 'purple' : 'red'}>
                      {donation.bloodType}
                    </Badge>
                  </Td>
                  <Td>{donation.quantity} mL</Td>
                  <Td>{donation.location}</Td>
                  <Td>{getStatusBadge(donation.status)}</Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        icon={<ViewIcon />}
                        size="xs"
                        aria-label="View donation"
                        onClick={() => handleViewDonation(donation)}
                      />
                      <IconButton
                        icon={<EditIcon />}
                        size="xs"
                        aria-label="Edit donation"
                        onClick={() => handleEditDonation(donation)}
                        isDisabled={donation.status === 'Transfused' || donation.status === 'Expired' || donation.status === 'Discarded'}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* View Donation Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="md">
        <ModalOverlay />
        <ModalContent>
          {selectedDonation && (
            <>
              <ModalHeader>
                Donation Details
                <Text fontSize="sm" fontWeight="normal" color="gray.600">
                  {selectedDonation.donationId}
                </Text>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={4}>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Donation Date:</Text>
                    <Text>{new Date(selectedDonation.date).toLocaleDateString()}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Blood Type:</Text>
                    <Badge colorScheme={selectedDonation.bloodType.includes('-') ? 'purple' : 'red'}>
                      {selectedDonation.bloodType}
                    </Badge>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Quantity:</Text>
                    <Text>{selectedDonation.quantity} mL</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Location:</Text>
                    <Text>{selectedDonation.location}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Status:</Text>
                    {getStatusBadge(selectedDonation.status)}
                  </Flex>
                  {selectedDonation.notes && (
                    <Box>
                      <Text fontWeight="bold">Notes:</Text>
                      <Text mt={2}>{selectedDonation.notes}</Text>
                    </Box>
                  )}
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onClick={onViewClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      {/* Add/Edit Donation Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditMode ? 'Edit Donation Record' : 'Add Donation Record'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl isInvalid={errors.bloodType}>
                  <FormLabel>Blood Type</FormLabel>
                  <Select
                    placeholder="Select blood type"
                    {...register('bloodType', {
                      required: 'Blood type is required',
                    })}
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
                  <FormErrorMessage>{errors.bloodType?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.quantity}>
                  <FormLabel>Quantity (mL)</FormLabel>
                  <Input
                    type="number"
                    {...register('quantity', {
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Quantity must be at least 1 mL' }
                    })}
                  />
                  <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.date}>
                  <FormLabel>Donation Date</FormLabel>
                  <Input
                    type="date"
                    {...register('date', {
                      required: 'Donation date is required',
                    })}
                  />
                  <FormErrorMessage>{errors.date?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.location}>
                  <FormLabel>Location</FormLabel>
                  <Input
                    {...register('location', {
                      required: 'Location is required',
                    })}
                  />
                  <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <Textarea {...register('notes')} />
                </FormControl>
              </Stack>
              
              <Flex justifyContent="space-between" mt={6}>
                <Button 
                  variant="ghost" 
                  onClick={onFormClose}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  colorScheme="blue"
                  isLoading={isSubmitting}
                >
                  {isEditMode ? 'Update' : 'Submit'}
                </Button>
              </Flex>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default DonationHistoryView;