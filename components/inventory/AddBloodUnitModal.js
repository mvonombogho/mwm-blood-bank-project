import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormErrorMessage,
  useToast,
  Grid,
  GridItem
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

const AddBloodUnitModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Calculate expiration date based on collection date and processing method
      // Different blood components have different shelf lives
      const collectionDate = new Date(data.collectionDate);
      let expirationDays = 42; // Default for whole blood (42 days)
      
      switch(data.processMethod) {
        case 'Plasma':
          expirationDays = 365; // 1 year for plasma
          break;
        case 'Platelets':
          expirationDays = 5; // 5 days for platelets
          break;
        case 'RBC':
          expirationDays = 42; // 42 days for red blood cells
          break;
        case 'Cryoprecipitate':
          expirationDays = 365; // 1 year for cryoprecipitate
          break;
      }
      
      const expirationDate = new Date(collectionDate);
      expirationDate.setDate(collectionDate.getDate() + expirationDays);
      
      // In a real app, this would be an API call
      // await axios.post('/api/inventory/blood-units', { ...data, expirationDate });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Blood unit added',
        description: `Blood unit ${data.unitId} has been successfully added to inventory.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      reset(); // Reset form
      onSuccess(); // Call success callback
      onClose(); // Close modal
    } catch (error) {
      console.error('Error adding blood unit:', error);
      toast({
        title: 'Error',
        description: 'Failed to add blood unit. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    reset(); // Reset form when closing
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Blood Unit</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Stack spacing={4}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired isInvalid={errors.unitId}>
                    <FormLabel>Unit ID</FormLabel>
                    <Input 
                      {...register('unitId', { 
                        required: 'Unit ID is required',
                        pattern: {
                          value: /^BLD-\d{4}-\d{4}$/,
                          message: 'Unit ID should follow format: BLD-YYYY-NNNN'
                        }
                      })} 
                      placeholder="BLD-2025-0001"
                    />
                    <FormErrorMessage>{errors.unitId?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl isRequired isInvalid={errors.donorId}>
                    <FormLabel>Donor ID</FormLabel>
                    <Input 
                      {...register('donorId', { 
                        required: 'Donor ID is required' 
                      })} 
                      placeholder="D10045"
                    />
                    <FormErrorMessage>{errors.donorId?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired isInvalid={errors.bloodType}>
                    <FormLabel>Blood Type</FormLabel>
                    <Select 
                      {...register('bloodType', { 
                        required: 'Blood type is required' 
                      })}
                      placeholder="Select blood type"
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
                </GridItem>
                
                <GridItem>
                  <FormControl isRequired isInvalid={errors.quantity}>
                    <FormLabel>Quantity (ml)</FormLabel>
                    <NumberInput min={1} max={1000} defaultValue={450}>
                      <NumberInputField 
                        {...register('quantity', { 
                          required: 'Quantity is required',
                          min: {
                            value: 1,
                            message: 'Quantity must be at least 1ml'
                          },
                          max: {
                            value: 1000,
                            message: 'Quantity cannot exceed 1000ml'
                          }
                        })} 
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.quantity?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired isInvalid={errors.collectionDate}>
                    <FormLabel>Collection Date</FormLabel>
                    <Input 
                      type="date" 
                      {...register('collectionDate', { 
                        required: 'Collection date is required' 
                      })} 
                    />
                    <FormErrorMessage>{errors.collectionDate?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl isRequired isInvalid={errors.processMethod}>
                    <FormLabel>Process Method</FormLabel>
                    <Select 
                      {...register('processMethod', { 
                        required: 'Process method is required' 
                      })}
                      placeholder="Select process method"
                    >
                      <option value="Whole Blood">Whole Blood</option>
                      <option value="Plasma">Plasma</option>
                      <option value="Platelets">Platelets</option>
                      <option value="RBC">Red Blood Cells</option>
                      <option value="Cryoprecipitate">Cryoprecipitate</option>
                    </Select>
                    <FormErrorMessage>{errors.processMethod?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired isInvalid={errors.facility}>
                    <FormLabel>Facility</FormLabel>
                    <Input 
                      {...register('facility', { 
                        required: 'Facility is required' 
                      })} 
                      placeholder="Main Storage"
                    />
                    <FormErrorMessage>{errors.facility?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl isRequired isInvalid={errors.storageUnit}>
                    <FormLabel>Storage Unit</FormLabel>
                    <Input 
                      {...register('storageUnit', { 
                        required: 'Storage unit is required' 
                      })} 
                      placeholder="Unit 1"
                    />
                    <FormErrorMessage>{errors.storageUnit?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input {...register('notes')} placeholder="Additional notes" />
              </FormControl>
            </Stack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              type="submit" 
              isLoading={isSubmitting}
              loadingText="Adding"
            >
              Add Blood Unit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddBloodUnitModal;
