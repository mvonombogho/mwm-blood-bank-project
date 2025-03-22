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
  Textarea,
  Box,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';

const AddStorageUnitModal = ({ isOpen, onClose, onStorageUnitAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { data: session } = useSession();
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      type: '',
      building: 'Main Building',
      floor: '1',
      room: 'Storage Room',
      targetTemp: 4,
      tempRange: 1,
      location: 'Main Facility',
      capacity: 50,
      manufacturer: '',
      modelNumber: '',
      notes: ''
    }
  });
  
  const selectedType = watch('type');
  
  // Update target temperature when type changes
  const handleTypeChange = (e) => {
    const type = e.target.value;
    const tempRange = getTemperatureRangeByType(type);
    setValue('targetTemp', tempRange.default);
  };
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      if (!session) {
        throw new Error("You must be logged in to add a storage unit.");
      }
      
      // Create a properly formatted storage unit object
      const storageUnitData = {
        storageUnitId: `SU-${Date.now().toString().slice(-6)}`, // Generate a unique ID
        name: data.name,
        facilityId: 'FAC001', // Default facility ID
        facilityName: data.location,
        type: data.type,
        location: {
          building: data.building || 'Main Building',
          floor: data.floor || '1',
          room: data.room || 'Storage Room',
          notes: data.locationNotes || ''
        },
        temperature: {
          min: parseFloat(data.targetTemp) - parseFloat(data.tempRange),
          max: parseFloat(data.targetTemp) + parseFloat(data.tempRange),
          target: parseFloat(data.targetTemp),
          units: 'Celsius'
        },
        capacity: {
          total: parseInt(data.capacity),
          used: 0,
          availablePercentage: 100,
          units: 'Units'
        },
        model: {
          manufacturer: data.manufacturer,
          modelNumber: data.modelNumber,
          serialNumber: data.serialNumber || '',
          year: data.year || new Date().getFullYear()
        },
        status: 'Operational',
        notes: data.notes || ''
      };

      // Make the actual API call
      const response = await fetch('/api/inventory/storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storageUnitData),
        credentials: 'include' // Include credentials (cookies) for authentication
      });
      
      // Handle unauthenticated case
      if (response.status === 401) {
        // Force refresh the session
        window.location.reload();
        throw new Error('Authentication required. Please sign in and try again.');
      }
      
      // Parse the response first to get error message if any
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add storage unit');
      }
      
      toast({
        title: 'Storage unit added',
        description: `Storage unit ${responseData.name} has been successfully added.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      reset(); // Reset form
      onStorageUnitAdded(responseData); // Call success callback with the new unit
      onClose(); // Close modal
    } catch (error) {
      console.error('Error adding storage unit:', error);
      setError(error.message || 'Failed to add storage unit. Please try again.');
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to add storage unit. Please try again.',
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
    setError(null);
    onClose();
  };
  
  // Get temperature range based on storage type
  const getTemperatureRangeByType = (type) => {
    switch (type) {
      case 'Refrigerator':
        return { min: 2, max: 6, default: 4 };
      case 'Freezer':
        return { min: -25, max: -18, default: -20 };
      case 'Deep Freezer':
        return { min: -40, max: -25, default: -30 };
      case 'Room Temperature Storage':
        return { min: 20, max: 24, default: 22 };
      case 'Transport Cooler':
        return { min: 1, max: 10, default: 4 };
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
            {error && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {!session && (
              <Alert status="warning" mb={4}>
                <AlertIcon />
                <AlertDescription>
                  You need to be signed in to add a storage unit. Please sign in and try again.
                </AlertDescription>
              </Alert>
            )}
            
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
                      onChange={handleTypeChange}
                    >
                      <option value="Refrigerator">Refrigerator</option>
                      <option value="Freezer">Freezer</option>
                      <option value="Deep Freezer">Deep Freezer</option>
                      <option value="Room Temperature Storage">Room Temperature Storage</option>
                      <option value="Transport Cooler">Transport Cooler</option>
                      <option value="Other">Other</option>
                    </Select>
                    <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
              </Grid>
              
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <GridItem>
                  <FormControl isRequired isInvalid={errors.building}>
                    <FormLabel>Building</FormLabel>
                    <Input 
                      {...register('building', { 
                        required: 'Building is required' 
                      })} 
                      placeholder="Main Building"
                    />
                    <FormErrorMessage>{errors.building?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl isInvalid={errors.floor}>
                    <FormLabel>Floor</FormLabel>
                    <Input 
                      {...register('floor')} 
                      placeholder="1"
                    />
                    <FormErrorMessage>{errors.floor?.message}</FormErrorMessage>
                  </FormControl>
                </GridItem>
                
                <GridItem>
                  <FormControl isRequired isInvalid={errors.room}>
                    <FormLabel>Room</FormLabel>
                    <Input 
                      {...register('room', { 
                        required: 'Room is required' 
                      })} 
                      placeholder="Storage Room"
                    />
                    <FormErrorMessage>{errors.room?.message}</FormErrorMessage>
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
                    <FormLabel>Facility Name</FormLabel>
                    <Input 
                      {...register('location', { 
                        required: 'Facility name is required' 
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
              isDisabled={!session}
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