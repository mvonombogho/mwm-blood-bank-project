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
  FormHelperText,
  Grid,
  GridItem,
  useToast
} from '@chakra-ui/react';

const AddTemperatureModal = ({ isOpen, onClose, onTemperatureAdded, storageUnit }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state with default values
  const [temperatureData, setTemperatureData] = useState({
    temperature: '',
    timestamp: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    recordedBy: '',
    notes: ''
  });
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTemperatureData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Submit temperature data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate temperature value
      if (isNaN(parseFloat(temperatureData.temperature))) {
        throw new Error('Please enter a valid temperature value');
      }
      
      // In a real application, this would be an API call
      // const response = await fetch(`/api/inventory/storage/${storageUnit.id}/temperature`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ...temperatureData,
      //     temperature: parseFloat(temperatureData.temperature),
      //     storageUnitId: storageUnit.id
      //   }),
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to add temperature reading');
      // }
      // 
      // const data = await response.json();
      
      // Mock response for testing
      const data = {
        id: Date.now().toString(),
        storageUnitId: storageUnit?.id || 'storage-1',
        temperature: parseFloat(temperatureData.temperature),
        timestamp: temperatureData.timestamp,
        recordedBy: temperatureData.recordedBy || 'System',
        notes: temperatureData.notes,
        createdAt: new Date().toISOString()
      };
      
      onTemperatureAdded(data);
      
      // Reset form
      setTemperatureData({
        temperature: '',
        timestamp: new Date().toISOString().slice(0, 16),
        recordedBy: '',
        notes: ''
      });
      
      // Close modal
      onClose();
      
      // Show success message
      toast({
        title: 'Temperature Reading Added',
        description: `Successfully added temperature reading for ${storageUnit?.name || 'storage unit'}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding temperature reading:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add temperature reading. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Add Temperature Reading
          {storageUnit && ` for ${storageUnit.name}`}
        </ModalHeader>
        <ModalCloseButton />
        
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem colSpan={1}>
                <FormControl isRequired>
                  <FormLabel>Temperature (°C)</FormLabel>
                  <Input 
                    name="temperature"
                    value={temperatureData.temperature}
                    onChange={handleChange}
                    type="number"
                    step="0.1"
                    placeholder="e.g., 4.2"
                  />
                  <FormHelperText>
                    Standard range: 2°C to 6°C
                  </FormHelperText>
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl isRequired>
                  <FormLabel>Date & Time</FormLabel>
                  <Input 
                    name="timestamp"
                    value={temperatureData.timestamp}
                    onChange={handleChange}
                    type="datetime-local"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel>Recorded By</FormLabel>
                  <Input 
                    name="recordedBy"
                    value={temperatureData.recordedBy}
                    onChange={handleChange}
                    placeholder="Staff ID or name"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Input 
                    name="notes"
                    value={temperatureData.notes}
                    onChange={handleChange}
                    placeholder="Any additional notes"
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              colorScheme="blue"
              isLoading={loading}
            >
              Save Reading
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddTemperatureModal;