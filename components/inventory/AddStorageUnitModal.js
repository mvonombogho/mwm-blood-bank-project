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
  GridItem,
  Textarea
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

const AddStorageUnitModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const selectedType = watch('type');
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      // await axios.post('/api/inventory/storage', data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Storage unit added',
        description: `Storage unit ${data.name} has been successfully added.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      reset(); // Reset form
      onSuccess(); // Call success callback
      onClose(); // Close modal
    } catch (error) {
      console.error('Error adding storage unit:', error);
      toast({
        title: 'Error',
        description: 'Failed to add storage unit. Please try again.',
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
  
  // Get temperature range based on storage type
  const getTemperatureRangeByType = (type) => {
    switch (type) {
      case 'Refrigerator':
        return { min: -4, max: 6, default: 4 };
      case 'Deep Freezer':
        return { min: -40, max: -18, default: -30 };
      case 'Incubator':
        return { min: 20, max: 24, default: 22 };
      case 'Transport Container':
        return { min: 1, max: 10, default: 4 };
      case 'Specialized Refrigerator':
        return { min: 2, max: 6, default: 4 };
      default:
        return { min: -40, max: 30, default: 4 };
    }
  };
  
  const tempRange = getTemperatureRangeByType(selectedType);
  
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Storage Unit</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Stack spacing={4}>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired isInvalid={errors.name}>
                    <FormLabel>Storage Unit Name</FormLabel>
                    <Input 
                      {...register('name', { 
                        required: 'Name is required'
                      })} 
                      placeholder="Main Refrigerator 2"
                    />
                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl isRequired isInvalid={errors.type}>
                    <FormLabel>Storage Type</FormLabel>
                    <Select 
                      {...register('type', { 
                        required: 'Type is required' 
                      })}
                      placeholder="Select storage type"
                    >
                      <option value="Refrigerator">Refrigerator</option>
                      <option value="Deep Freezer">Deep Freezer</option>
                      <option value="Incubator">Incubator</option>
                      <option value="Transport Container">Transport Container</option>
                      <option value="Specialized Refrigerator">Specialized Refrigerator</option>
                    </Select>
                    <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired isInvalid={errors.targetTemp}>
                    <FormLabel>Target Temperature (°C)</FormLabel>
                    <NumberInput 
                      min={tempRange.min} 
                      max={tempRange.max} 
                      defaultValue={tempRange.default}
                      precision={1}
                    >
                      <NumberInputField 
                        {...register('targetTemp', { 
                          required: 'Target temperature is required',
                          valueAsNumber: true
                        })} 
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.targetTemp?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl isRequired isInvalid={errors.tempRange}>
                    <FormLabel>Temperature Range (±°C)</FormLabel>
                    <NumberInput min={0.1} max={5} defaultValue={1.0} precision={1} step={0.1}>
                      <NumberInputField 
                        {...register('tempRange', { 
                          required: 'Temperature range is required',
                          valueAsNumber: true
                        })} 
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.tempRange?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired isInvalid={errors.location}>
                    <FormLabel>Location</FormLabel>
                    <Input 
                      {...register('location', { 
                        required: 'Location is required' 
                      })} 
                      placeholder="Main Facility"
                    />
                    <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl isRequired isInvalid={errors.capacity}>
                    <FormLabel>Capacity (Units)</FormLabel>
                    <NumberInput min={1} max={1000} defaultValue={50}>
                      <NumberInputField 
                        {...register('capacity', { 
                          required: 'Capacity is required',
                          valueAsNumber: true
                        })} 
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormErrorMessage>{errors.capacity?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired isInvalid={errors.manufacturer}>
                    <FormLabel>Manufacturer</FormLabel>
                    <Input 
                      {...register('manufacturer', { 
                        required: 'Manufacturer is required' 
                      })} 
                      placeholder="Manufacturer name"
                    />
                    <FormErrorMessage>{errors.manufacturer?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl isRequired isInvalid={errors.modelNumber}>
                    <FormLabel>Model Number</FormLabel>
                    <Input 
                      {...register('modelNumber', { 
                        required: 'Model number is required' 
                      })} 
                      placeholder="Model number"
                    />
                    <FormErrorMessage>{errors.modelNumber?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea 
                  {...register('notes')} 
                  placeholder="Additional notes about this storage unit" 
                  rows={3}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              type="submit" 
              isLoading={isSubmitting}
              loadingText="Adding"
            >
              Add Storage Unit
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddStorageUnitModal;
