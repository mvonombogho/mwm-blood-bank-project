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
  Textarea,
  Grid,
  GridItem,
  Divider,
  Text,
  useToast
} from '@chakra-ui/react';

const AddBloodUnitModal = ({ isOpen, onClose, onBloodUnitAdded }) => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [bloodUnit, setBloodUnit] = useState({
    unitId: `BU-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    bloodType: '',
    quantity: 450,
    collectionDate: new Date().toISOString().split('T')[0],
    expirationDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Quarantined',
    location: {
      facility: 'Main Blood Bank',
      storageUnit: 'Refrigerator 1',
      shelf: 'A',
      position: ''
    },
    notes: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBloodUnit({
        ...bloodUnit,
        [parent]: {
          ...bloodUnit[parent],
          [child]: value
        }
      });
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
    
    try {
      // In a real application, you would make an API call here
      // const response = await fetch('/api/inventory/blood-units', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(bloodUnit),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to add blood unit');
      // }
      
      // const data = await response.json();
      
      // For now we'll simulate a successful API response
      const mockResponse = {
        ...bloodUnit,
        _id: Date.now().toString(),
        statusHistory: [
          {
            status: 'Quarantined',
            date: new Date(),
            updatedBy: 'System',
            notes: 'Initial status after collection'
          }
        ]
      };
      
      // Call the parent callback with the new blood unit
      onBloodUnitAdded(mockResponse);
      
      // Reset form
      setBloodUnit({
        unitId: `BU-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        bloodType: '',
        quantity: 450,
        collectionDate: new Date().toISOString().split('T')[0],
        expirationDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Quarantined',
        location: {
          facility: 'Main Blood Bank',
          storageUnit: 'Refrigerator 1',
          shelf: 'A',
          position: ''
        },
        notes: ''
      });
      
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
                <Text fontWeight="medium" mb={2}>Storage Location</Text>
                <Divider mb={2} />
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl isRequired>
                  <FormLabel>Facility</FormLabel>
                  <Input 
                    name="location.facility"
                    value={bloodUnit.location.facility}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl isRequired>
                  <FormLabel>Storage Unit</FormLabel>
                  <Input 
                    name="location.storageUnit"
                    value={bloodUnit.location.storageUnit}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl>
                  <FormLabel>Shelf</FormLabel>
                  <Input 
                    name="location.shelf"
                    value={bloodUnit.location.shelf}
                    onChange={handleChange}
                  />
                </FormControl>
              </GridItem>
              
              <GridItem colSpan={1}>
                <FormControl>
                  <FormLabel>Position</FormLabel>
                  <Input 
                    name="location.position"
                    value={bloodUnit.location.position}
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