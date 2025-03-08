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
  FormErrorMessage,
  Checkbox,
  RadioGroup,
  Radio
} from '@chakra-ui/react';
import { AddIcon, EditIcon, ViewIcon, DeleteIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';

const TransfusionRecordView = ({ recipientId }) => {
  const [transfusions, setTransfusions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransfusion, setSelectedTransfusion] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const toast = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableBloodUnits, setAvailableBloodUnits] = useState([]);
  const [isLoadingBloodUnits, setIsLoadingBloodUnits] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm();

  const watchReactions = watch('reactions.occurred', false);

  useEffect(() => {
    fetchTransfusions();
  }, [recipientId]);

  const fetchTransfusions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/recipients/transfusions?recipientId=${recipientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transfusions');
      }
      const data = await response.json();
      setTransfusions(data.data || []);
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

  const fetchAvailableBloodUnits = async (bloodType = null) => {
    try {
      setIsLoadingBloodUnits(true);
      
      let url = '/api/inventory/blood-units?status=Available';
      if (bloodType) {
        url += `&bloodType=${bloodType}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch available blood units');
      }
      
      const data = await response.json();
      setAvailableBloodUnits(data.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setAvailableBloodUnits([]);
    } finally {
      setIsLoadingBloodUnits(false);
    }
  };

  const handleViewTransfusion = (transfusion) => {
    setSelectedTransfusion(transfusion);
    onViewOpen();
  };

  const handleAddTransfusion = () => {
    setIsEditMode(false);
    setSelectedTransfusion(null);
    
    // Get recipient's blood type and fetch compatible blood units
    const recipient = transfusions[0]?.recipient;
    if (recipient && recipient.bloodType) {
      fetchAvailableBloodUnits(recipient.bloodType);
    } else {
      fetchAvailableBloodUnits();
    }
    
    reset({
      bloodUnitId: '',
      transfusionDate: new Date().toISOString().split('T')[0],
      hospital: '',
      physician: '',
      diagnosis: '',
      quantity: '',
      reactions: {
        occurred: false,
        details: '',
        severity: 'Mild',
        treatmentProvided: ''
      },
      outcome: 'Successful',
      notes: ''
    });
    
    onFormOpen();
  };

  const handleEditTransfusion = (transfusion) => {
    setIsEditMode(true);
    setSelectedTransfusion(transfusion);
    
    // Format date for form input
    const formattedDate = transfusion.transfusionDate 
      ? new Date(transfusion.transfusionDate).toISOString().split('T')[0]
      : '';
    
    reset({
      transfusionDate: formattedDate,
      hospital: transfusion.hospital,
      physician: transfusion.physician,
      diagnosis: transfusion.diagnosis,
      quantity: transfusion.quantity,
      reactions: {
        occurred: transfusion.reactions?.occurred || false,
        details: transfusion.reactions?.details || '',
        severity: transfusion.reactions?.severity || 'Mild',
        treatmentProvided: transfusion.reactions?.treatmentProvided || ''
      },
      outcome: transfusion.outcome || 'Successful',
      notes: transfusion.notes || ''
    });
    
    onFormOpen();
  };

  const handleDeleteTransfusion = (transfusion) => {
    setSelectedTransfusion(transfusion);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/recipients/transfusions/${selectedTransfusion.transfusionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete transfusion record');
      }
      
      toast({
        title: 'Transfusion Deleted',
        description: 'Transfusion record has been deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setTransfusions(transfusions.filter(t => t.transfusionId !== selectedTransfusion.transfusionId));
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
      if (data.transfusionDate) {
        data.transfusionDate = new Date(data.transfusionDate).toISOString();
      }
      
      let response;
      
      if (isEditMode) {
        // Update existing transfusion
        response = await fetch(`/api/recipients/transfusions/${selectedTransfusion.transfusionId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } else {
        // Create new transfusion
        response = await fetch('/api/recipients/transfusions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientId,
            bloodUnitId: data.bloodUnitId,
            transfusionData: data
          }),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }
      
      const result = await response.json();
      
      toast({
        title: isEditMode ? 'Transfusion Updated' : 'Transfusion Created',
        description: isEditMode 
          ? 'Transfusion record has been updated successfully' 
          : 'New transfusion record has been created',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh the list
      fetchTransfusions();
      
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

  const handleBloodTypeFilter = (bloodType) => {
    fetchAvailableBloodUnits(bloodType);
  };

  const getOutcomeBadge = (outcome) => {
    switch(outcome) {
      case 'Successful':
        return <Badge colorScheme="green">{outcome}</Badge>;
      case 'Partially Successful':
        return <Badge colorScheme="yellow">{outcome}</Badge>;
      case 'Unsuccessful':
        return <Badge colorScheme="red">{outcome}</Badge>;
      case 'Complications':
        return <Badge colorScheme="orange">{outcome}</Badge>;
      default:
        return <Badge>{outcome}</Badge>;
    }
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="md">Transfusion Records</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          size="sm"
          onClick={handleAddTransfusion}
        >
          Add Transfusion
        </Button>
      </Flex>
      
      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" height="100px">
          <Spinner />
        </Flex>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : transfusions.length === 0 ? (
        <Text color="gray.500">No transfusion records found for this recipient.</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Transfusion ID</Th>
                <Th>Date</Th>
                <Th>Blood Type</Th>
                <Th>Quantity</Th>
                <Th>Hospital</Th>
                <Th>Outcome</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transfusions.map((transfusion) => (
                <Tr key={transfusion.transfusionId}>
                  <Td>{transfusion.transfusionId}</Td>
                  <Td>{new Date(transfusion.transfusionDate).toLocaleDateString()}</Td>
                  <Td>
                    <Badge colorScheme={transfusion.bloodType.includes('-') ? 'purple' : 'red'}>
                      {transfusion.bloodType}
                    </Badge>
                  </Td>
                  <Td>{transfusion.quantity} mL</Td>
                  <Td>{transfusion.hospital}</Td>
                  <Td>{getOutcomeBadge(transfusion.outcome)}</Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton
                        icon={<ViewIcon />}
                        size="xs"
                        aria-label="View transfusion"
                        onClick={() => handleViewTransfusion(transfusion)}
                      />
                      <IconButton
                        icon={<EditIcon />}
                        size="xs"
                        aria-label="Edit transfusion"
                        onClick={() => handleEditTransfusion(transfusion)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="xs"
                        colorScheme="red"
                        aria-label="Delete transfusion"
                        onClick={() => handleDeleteTransfusion(transfusion)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* View Transfusion Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          {selectedTransfusion && (
            <>
              <ModalHeader>
                Transfusion Record Details
                <Text fontSize="sm" fontWeight="normal" color="gray.600">
                  {selectedTransfusion.transfusionId}
                </Text>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={4}>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Transfusion Date:</Text>
                    <Text>{new Date(selectedTransfusion.transfusionDate).toLocaleString()}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Blood Type:</Text>
                    <Badge colorScheme={selectedTransfusion.bloodType.includes('-') ? 'purple' : 'red'}>
                      {selectedTransfusion.bloodType}
                    </Badge>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Quantity:</Text>
                    <Text>{selectedTransfusion.quantity} mL</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Hospital:</Text>
                    <Text>{selectedTransfusion.hospital}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Physician:</Text>
                    <Text>{selectedTransfusion.physician}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Diagnosis:</Text>
                    <Text>{selectedTransfusion.diagnosis}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Outcome:</Text>
                    {getOutcomeBadge(selectedTransfusion.outcome)}
                  </Flex>
                  
                  <Box>
                    <Text fontWeight="bold">Reactions:</Text>
                    {selectedTransfusion.reactions?.occurred ? (
                      <Box mt={2} pl={4}>
                        <Flex>
                          <Text fontWeight="bold" width="100px">Severity:</Text>
                          <Badge colorScheme={
                            selectedTransfusion.reactions.severity === 'Severe' || 
                            selectedTransfusion.reactions.severity === 'Life-threatening' ? 
                            'red' : 'yellow'
                          }>
                            {selectedTransfusion.reactions.severity}
                          </Badge>
                        </Flex>
                        <Text mt={2}><b>Details:</b> {selectedTransfusion.reactions.details}</Text>
                        {selectedTransfusion.reactions.treatmentProvided && (
                          <Text mt={2}><b>Treatment:</b> {selectedTransfusion.reactions.treatmentProvided}</Text>
                        )}
                      </Box>
                    ) : (
                      <Text ml={2} mt={2}>No adverse reactions reported</Text>
                    )}
                  </Box>
                  
                  {selectedTransfusion.notes && (
                    <Box>
                      <Text fontWeight="bold">Notes:</Text>
                      <Text mt={2}>{selectedTransfusion.notes}</Text>
                    </Box>
                  )}
                  
                  {selectedTransfusion.bloodUnit && (
                    <Box>
                      <Text fontWeight="bold">Blood Unit Information:</Text>
                      <Stack spacing={2} mt={2} pl={4}>
                        <Flex>
                          <Text fontWeight="bold" width="100px">Unit ID:</Text>
                          <Text>{selectedTransfusion.bloodUnit.unitId}</Text>
                        </Flex>
                      </Stack>
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
                    handleEditTransfusion(selectedTransfusion);
                  }}
                >
                  Edit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      {/* Add/Edit Transfusion Form Modal */}
      <Modal isOpen={isFormOpen} onClose={onFormClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditMode ? 'Edit Transfusion Record' : 'Add Transfusion Record'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                {!isEditMode && (
                  <FormControl isInvalid={errors.bloodUnitId}>
                    <FormLabel>Blood Unit</FormLabel>
                    {isLoadingBloodUnits ? (
                      <Flex align="center">
                        <Spinner size="sm" mr={2} />
                        <Text>Loading available blood units...</Text>
                      </Flex>
                    ) : availableBloodUnits.length === 0 ? (
                      <Text color="red.500">No available blood units found</Text>
                    ) : (
                      <>
                        <Select
                          placeholder="Select blood unit"
                          {...register('bloodUnitId', {
                            required: 'Blood unit is required',
                          })}
                        >
                          {availableBloodUnits.map(unit => (
                            <option key={unit._id} value={unit._id}>
                              {unit.unitId} - {unit.bloodType} - Expires: {new Date(unit.expirationDate).toLocaleDateString()}
                            </option>
                          ))}
                        </Select>
                        <FormErrorMessage>{errors.bloodUnitId?.message}</FormErrorMessage>
                      </>
                    )}
                  </FormControl>
                )}
                
                <FormControl isInvalid={errors.transfusionDate}>
                  <FormLabel>Transfusion Date</FormLabel>
                  <Input
                    type="date"
                    {...register('transfusionDate', {
                      required: 'Transfusion date is required',
                    })}
                  />
                  <FormErrorMessage>{errors.transfusionDate?.message}</FormErrorMessage>
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
                
                <FormControl isInvalid={errors.diagnosis}>
                  <FormLabel>Diagnosis/Reason</FormLabel>
                  <Textarea
                    {...register('diagnosis', {
                      required: 'Diagnosis is required',
                    })}
                  />
                  <FormErrorMessage>{errors.diagnosis?.message}</FormErrorMessage>
                </FormControl>
                
                {!isEditMode && (
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
                )}
                
                <FormControl>
                  <FormLabel>Reactions</FormLabel>
                  <Checkbox
                    {...register('reactions.occurred')}
                  >
                    Adverse reactions occurred
                  </Checkbox>
                </FormControl>
                
                {watchReactions && (
                  <Box pl={6}>
                    <Stack spacing={4}>
                      <FormControl isInvalid={errors.reactions?.details}>
                        <FormLabel>Reaction Details</FormLabel>
                        <Textarea
                          {...register('reactions.details', {
                            required: watchReactions ? 'Reaction details are required' : false,
                          })}
                        />
                        <FormErrorMessage>{errors.reactions?.details?.message}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl isInvalid={errors.reactions?.severity}>
                        <FormLabel>Severity</FormLabel>
                        <Select
                          {...register('reactions.severity', {
                            required: watchReactions ? 'Severity is required' : false,
                          })}
                        >
                          <option value="Mild">Mild</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Severe">Severe</option>
                          <option value="Life-threatening">Life-threatening</option>
                        </Select>
                        <FormErrorMessage>{errors.reactions?.severity?.message}</FormErrorMessage>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Treatment Provided</FormLabel>
                        <Textarea {...register('reactions.treatmentProvided')} />
                      </FormControl>
                    </Stack>
                  </Box>
                )}
                
                <FormControl isInvalid={errors.outcome}>
                  <FormLabel>Outcome</FormLabel>
                  <Select
                    {...register('outcome', {
                      required: 'Outcome is required',
                    })}
                  >
                    <option value="Successful">Successful</option>
                    <option value="Partially Successful">Partially Successful</option>
                    <option value="Unsuccessful">Unsuccessful</option>
                    <option value="Complications">Complications</option>
                  </Select>
                  <FormErrorMessage>{errors.outcome?.message}</FormErrorMessage>
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
            Are you sure you want to delete this transfusion record? This action cannot be undone.
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

export default TransfusionRecordView;