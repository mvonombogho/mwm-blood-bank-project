import { useState, useEffect } from 'react';
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
  Textarea,
  Grid,
  GridItem,
  Divider,
  Text,
  useToast,
  Box,
  Alert,
  AlertIcon
} from '@chakra-ui/react';

const AddBloodUnitModal = ({ isOpen, onClose, onBloodUnitAdded }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state
  const [bloodUnit, setBloodUnit] = useState({
    unitId: `BU-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    bloodType: '',
    // Removed hardcoded donorId
    quantity: 450,
    collectionDate: new Date().toISOString().split('T')[0],
    expirationDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Quarantined',
    // Made storage location optional
    notes: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (!bloodUnit[parent]) {
        // Initialize the parent object if it doesn't exist
        setBloodUnit({
          ...bloodUnit,
          [parent]: { [child]: value }
        });
      } else {
        setBloodUnit({
          ...bloodUnit,
          [parent]: {
            ...bloodUnit[parent],
            [child]: value
          }
        });
      }
    } else {
      setBloodUnit({
        ...bloodUnit,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Make the actual API call to add a blood unit
      const response = await fetch('/api/inventory/blood-units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bloodUnit),
      });
      
      // Get the response data
      const data = await response.json();
      
      if (!response.ok) {
        // If the server responded with an error, throw it with the error message
        throw new Error(data.message || 'Failed to add blood unit');
      }
      
      // Call the parent callback with the new blood unit
      onBloodUnitAdded(data);
      
      // Reset form
      setBloodUnit({
        unitId: `BU-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        bloodType: '',
        quantity: 450,
        collectionDate: new Date().toISOString().split('T')[0],
        expirationDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Quarantined',
        notes: ''
      });
      
    } catch (error) {
      console.error('Error adding blood unit:', error);
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add blood unit. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Blood Unit</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && (
              <Box bg="red.50" p={3} color="red.600" mb={4} borderRadius="md">
                {error}
              </Box>
            )}
            
            <Alert status="info" mb={4}>
              <AlertIcon />
              Storage location fields are now optional. Donor field has been removed.
            </Alert>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem colSpan={1}>
                <FormControl isRequired>
                  <FormLabel>Unit ID</FormLabel>
                  <Input 
                    name="unitId"
                    value={bloodUnit.unitId}
                    onChange={handleChange}
                    placeholder="e.g., BU-A-1001"
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl isRequired>
                  <FormLabel>Blood Type</FormLabel>
                  <Select 
                    name="bloodType"
                    value={bloodUnit.bloodType}
                    onChange={handleChange}
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
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl isRequired>
                  <FormLabel>Quantity (ml)</FormLabel>
                  <Input 
                    type="number"
                    name="quantity"
                    value={bloodUnit.quantity}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    name="status"
                    value={bloodUnit.status}
                    onChange={handleChange}
                  >
                    <option value="Quarantined">Quarantined</option>
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Discarded">Discarded</option>
                    <option value="Transfused">Transfused</option>
                    <option value="Expired">Expired</option>
                  </Select>
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl isRequired>
                  <FormLabel>Collection Date</FormLabel>
                  <Input 
                    type="date"
                    name="collectionDate"
                    value={bloodUnit.collectionDate}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl isRequired>
                  <FormLabel>Expiration Date</FormLabel>
                  <Input 
                    type="date"
                    name="expirationDate"
                    value={bloodUnit.expirationDate}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={2}>
                <Text fontWeight="medium" mb={2}>Storage Location (Optional)</Text>
                <Divider mb={2} />
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl>
                  <FormLabel>Facility</FormLabel>
                  <Input 
                    name="location.facility"
                    value={bloodUnit.location?.facility || ''}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl>
                  <FormLabel>Storage Unit</FormLabel>
                  <Input 
                    name="location.storageUnit"
                    value={bloodUnit.location?.storageUnit || ''}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl>
                  <FormLabel>Shelf</FormLabel>
                  <Input 
                    name="location.shelf"
                    value={bloodUnit.location?.shelf || ''}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl>
                  <FormLabel>Position</FormLabel>
                  <Input 
                    name="location.position"
                    value={bloodUnit.location?.position || ''}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea 
                    name="notes"
                    value={bloodUnit.notes}
                    onChange={handleChange}
                    placeholder="Any additional notes about this blood unit"
                  />
                </FormControl>
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit"
              colorScheme="blue"
              isLoading={loading}
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