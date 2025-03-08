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
import { AddIcon, EditIcon, ViewIcon, DeleteIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';

const BloodRequestsView = ({ recipientId }) => {
  const [bloodRequests, setBloodRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    fetchBloodRequests();
  }, [recipientId]);

  const fetchBloodRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/recipients/blood-requests?recipientId=${recipientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch blood requests');
      }
      const data = await response.json();
      setBloodRequests(data.data || []);
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
      setIsLoading(false);
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    onViewOpen();
  };

  const handleAddRequest = () => {
    setIsEditMode(false);
    setSelectedRequest(null);
    reset({
      bloodType: '',
      quantity: '',
      urgency: 'Medium',
      requiredBy: '',
      hospital: '',
      physician: '',
      reason: '',
      notes: ''
    });
    onFormOpen();
  };

  const handleEditRequest = (request) => {
    setIsEditMode(true);
    setSelectedRequest(request);
    
    // Format date for form input
    const formattedDate = request.requiredBy 
      ? new Date(request.requiredBy).toISOString().split('T')[0]
      : '';
    
    reset({
      bloodType: request.bloodType,
      quantity: request.quantity,
      urgency: request.urgency,
      requiredBy: formattedDate,
      hospital: request.hospital,
      physician: request.physician,
      reason: request.reason,
      notes: request.notes,
      status: request.status
    });
    
    onFormOpen();
  };

  const handleDeleteRequest = (request) => {
    setSelectedRequest(request);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/recipients/blood-requests/${selectedRequest.requestId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete blood request');
      }
      
      toast({
        title: 'Request Deleted',
        description: 'Blood request has been deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setBloodRequests(bloodRequests.filter(r => r.requestId !== selectedRequest.requestId));
      onDeleteClose();
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

  const onSubmit = async (data) => {
    try {
      // Format date for API
      if (data.requiredBy) {
        data.requiredBy = new Date(data.requiredBy).toISOString();
      }
      
      let response;
      
      if (isEditMode) {
        // Update existing request
        response = await fetch(`/api/recipients/blood-requests/${selectedRequest.requestId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new request
        response = await fetch('/api/recipients/blood-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId,
            requestData: data
          }),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }
      
      const result = await response.json();
      
      toast({
        title: isEditMode ? 'Request Updated' : 'Request Created',
        description: isEditMode 
          ? 'Blood request has been updated successfully' 
          : 'New blood request has been created',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh the list
      fetchBloodRequests();
      
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

  const getUrgencyBadge = (urgency) => {
    switch(urgency) {
      case 'Low':
        return <Badge colorScheme="green">{urgency}</Badge>;
      case 'Medium':
        return <Badge colorScheme="blue">{urgency}</Badge>;
      case 'High':
        return <Badge colorScheme="orange">{urgency}</Badge>;
      case 'Critical':
        return <Badge colorScheme="red">{urgency}</Badge>;
      default:
        return <Badge>{urgency}</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending':
        return <Badge colorScheme="yellow">{status}</Badge>;
      case 'Processing':
        return <Badge colorScheme="blue">{status}</Badge>;
      case 'Fulfilled':
        return <Badge colorScheme="green">{status}</Badge>;
      case 'Cancelled':
        return <Badge colorScheme="red">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="md">Blood Requests</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          size="sm"
          onClick={handleAddRequest}
        >
          Add Request
        </Button>
      </Flex>
      
      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" height="100px">
          <Spinner />
        </Flex>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : bloodRequests.length === 0 ? (
        <Text color="gray.500">No blood requests found for this recipient.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Request ID</Th>
                <Th>Date</Th>
                <Th>Blood Type</Th>
                <Th>Quantity</Th>
                <Th>Urgency</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bloodRequests.map((request) => (
                <Tr key={request.requestId}>
                  <Td>{request.requestId}</Td>
                  <Td>{new Date(request.requestDate).toLocaleDateString()}</Td>
                  <Td>
                    <Badge colorScheme={request.bloodType.includes('-') ? 'purple' : 'red'}>
                      {request.bloodType}
                    </Badge>
                  </Td>
                  <Td>{request.quantity} mL</Td>
                  <Td>{getUrgencyBadge(request.urgency)}</Td>
                  <Td>{getStatusBadge(request.status)}</Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        icon={<ViewIcon />}
                        size="xs"
                        aria-label="View request"
                        onClick={() => handleViewRequest(request)}
                      />
                      <IconButton
                        icon={<EditIcon />}
                        size="xs"
                        aria-label="Edit request"
                        onClick={() => handleEditRequest(request)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="xs"
                        colorScheme="red"
                        aria-label="Delete request"
                        onClick={() => handleDeleteRequest(request)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* View Request Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          {selectedRequest && (
            <>
              <ModalHeader>
                Blood Request Details
                <Text fontSize="sm" fontWeight="normal" color="gray.600">
                  {selectedRequest.requestId}
                </Text>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={4}>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Request Date:</Text>
                    <Text>{new Date(selectedRequest.requestDate).toLocaleString()}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Blood Type:</Text>
                    <Badge colorScheme={selectedRequest.bloodType.includes('-') ? 'purple' : 'red'}>
                      {selectedRequest.bloodType}
                    </Badge>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Quantity:</Text>
                    <Text>{selectedRequest.quantity} mL</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Urgency:</Text>
                    {getUrgencyBadge(selectedRequest.urgency)}
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Status:</Text>
                    {getStatusBadge(selectedRequest.status)}
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Required By:</Text>
                    <Text>
                      {selectedRequest.requiredBy 
                        ? new Date(selectedRequest.requiredBy).toLocaleDateString() 
                        : 'Not specified'}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Hospital:</Text>
                    <Text>{selectedRequest.hospital}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Physician:</Text>
                    <Text>{selectedRequest.physician}</Text>
                  </Flex>
                  <Box>
                    <Text fontWeight="bold">Reason:</Text>
                    <Text mt={2}>{selectedRequest.reason}</Text>
                  </Box>
                  {selectedRequest.notes && (
                    <Box>
                      <Text fontWeight="bold">Notes:</Text>
                      <Text mt={2}>{selectedRequest.notes}</Text>
                    </Box>
                  )}
                </Stack>
              </ModalBody>
              <ModalFooter>
                <Button 
                  variant="ghost" 
                  mr={3} 
                  onClick={onViewClose}
                >
                  Close
                </Button>
                <Button 
                  colorScheme="blue" 
                  onClick={() => {
                    onViewClose();
                    handleEditRequest(selectedRequest);
                  }}
                >
                  Edit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      {/* Add/Edit Request Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditMode ? 'Edit Blood Request' : 'Add Blood Request'}
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
                
                <FormControl isInvalid={errors.urgency}>
                  <FormLabel>Urgency</FormLabel>
                  <Select
                    {...register('urgency', {
                      required: 'Urgency is required',
                    })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </Select>
                  <FormErrorMessage>{errors.urgency?.message}</FormErrorMessage>
                </FormControl>
                
                {isEditMode && (
                  <FormControl isInvalid={errors.status}>
                    <FormLabel>Status</FormLabel>
                    <Select
                      {...register('status', {
                        required: 'Status is required',
                      })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Fulfilled">Fulfilled</option>
                      <option value="Cancelled">Cancelled</option>
                    </Select>
                    <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
                  </FormControl>
                )}
                
                <FormControl>
                  <FormLabel>Required By (Optional)</FormLabel>
                  <Input
                    type="date"
                    {...register('requiredBy')}
                  />
                </FormControl>
                
                <FormControl isInvalid={errors.hospital}>
                  <FormLabel>Hospital</FormLabel>
                  <Input
                    {...register('hospital', {
                      required: 'Hospital is required',
                    })}
                  />
                  <FormErrorMessage>{errors.hospital?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.physician}>
                  <FormLabel>Physician</FormLabel>
                  <Input
                    {...register('physician', {
                      required: 'Physician is required',
                    })}
                  />
                  <FormErrorMessage>{errors.physician?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.reason}>
                  <FormLabel>Reason</FormLabel>
                  <Textarea
                    {...register('reason', {
                      required: 'Reason is required',
                    })}
                  />
                  <FormErrorMessage>{errors.reason?.message}</FormErrorMessage>
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
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this blood request? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BloodRequestsView;