import { useState, useEffect } from 'react';
import { 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td, 
  Button, 
  Box, 
  Flex, 
  Heading, 
  Input, 
  Select, 
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Text,
  Badge,
  Tooltip,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { SearchIcon, EditIcon, ViewIcon, DeleteIcon, AddIcon } from '@chakra-ui/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';

const RecipientList = () => {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [recipientToDelete, setRecipientToDelete] = useState(null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recipients');
      if (!response.ok) {
        throw new Error('Failed to fetch recipients');
      }
      const data = await response.json();
      setRecipients(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (recipient) => {
    setRecipientToDelete(recipient);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/recipients/${recipientToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipient');
      }

      // Remove the deleted recipient from the state
      setRecipients(recipients.filter(r => r._id !== recipientToDelete._id));
      
      toast({
        title: 'Success',
        description: 'Recipient deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteConfirmOpen(false);
      setRecipientToDelete(null);
    }
  };

  const handleViewDetails = (recipient) => {
    setSelectedRecipient(recipient);
    onOpen();
  };

  const handleEdit = (recipient) => {
    router.push(`/recipients/edit/${recipient._id}`);
  };

  const filteredRecipients = recipients.filter(recipient => {
    const matchesSearch = 
      recipient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.recipientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloodType = bloodTypeFilter === '' || recipient.bloodType === bloodTypeFilter;
    
    return matchesSearch && matchesBloodType;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <Badge colorScheme="green">{status}</Badge>;
      case 'Inactive':
        return <Badge colorScheme="yellow">{status}</Badge>;
      case 'Deceased':
        return <Badge colorScheme="gray">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Recipients</Heading>
        <Link href="/recipients/add" passHref>
          <Button leftIcon={<AddIcon />} colorScheme="blue">
            Add Recipient
          </Button>
        </Link>
      </Flex>
      
      <Flex mb={6} gap={4}>
        <Box flex="1">
          <Input
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<SearchIcon />}
          />
        </Box>
        <Box width="200px">
          <Select
            placeholder="Filter by blood type"
            value={bloodTypeFilter}
            onChange={(e) => setBloodTypeFilter(e.target.value)}
          >
            <option value="">All Blood Types</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Select>
        </Box>
      </Flex>
      
      {loading ? (
        <Flex justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Text color="red.500">Error: {error}</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Name</Th>
                <Th>Blood Type</Th>
                <Th>Status</Th>
                <Th>Last Transfusion</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredRecipients.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center">No recipients found</Td>
                </Tr>
              ) : (
                filteredRecipients.map((recipient) => (
                  <Tr key={recipient._id}>
                    <Td>{recipient.recipientId}</Td>
                    <Td>{recipient.firstName} {recipient.lastName}</Td>
                    <Td>
                      <Badge colorScheme={recipient.bloodType.includes('-') ? 'purple' : 'red'}>
                        {recipient.bloodType}
                      </Badge>
                    </Td>
                    <Td>{getStatusBadge(recipient.status)}</Td>
                    <Td>
                      {recipient.lastTransfusionDate 
                        ? new Date(recipient.lastTransfusionDate).toLocaleDateString()
                        : 'None'
                      }
                    </Td>
                    <Td>
                      <Flex gap={2}>
                        <Tooltip label="View Details">
                          <IconButton
                            icon={<ViewIcon />}
                            size="sm"
                            aria-label="View recipient details"
                            onClick={() => handleViewDetails(recipient)}
                          />
                        </Tooltip>
                        <Tooltip label="Edit">
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            aria-label="Edit recipient"
                            onClick={() => handleEdit(recipient)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete">
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            aria-label="Delete recipient"
                            onClick={() => handleDeleteClick(recipient)}
                          />
                        </Tooltip>
                      </Flex>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      )}
      
      {/* Recipient Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          {selectedRecipient && (
            <>
              <ModalHeader>
                Recipient Details: {selectedRecipient.firstName} {selectedRecipient.lastName}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Flex flexDirection="column" gap={3}>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Recipient ID:</Text>
                    <Text>{selectedRecipient.recipientId}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Blood Type:</Text>
                    <Badge colorScheme={selectedRecipient.bloodType.includes('-') ? 'purple' : 'red'}>
                      {selectedRecipient.bloodType}
                    </Badge>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Status:</Text>
                    {getStatusBadge(selectedRecipient.status)}
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Date of Birth:</Text>
                    <Text>{new Date(selectedRecipient.dateOfBirth).toLocaleDateString()}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Gender:</Text>
                    <Text>{selectedRecipient.gender}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Email:</Text>
                    <Text>{selectedRecipient.email || 'N/A'}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Phone:</Text>
                    <Text>{selectedRecipient.phone}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Address:</Text>
                    <Text>
                      {selectedRecipient.address.street}, {selectedRecipient.address.city}, {selectedRecipient.address.state} {selectedRecipient.address.zipCode}, {selectedRecipient.address.country}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Transfusion Count:</Text>
                    <Text>{selectedRecipient.transfusionCount || 0}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Last Transfusion:</Text>
                    <Text>
                      {selectedRecipient.lastTransfusionDate 
                        ? new Date(selectedRecipient.lastTransfusionDate).toLocaleDateString() 
                        : 'None'}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Registration Date:</Text>
                    <Text>{new Date(selectedRecipient.registrationDate).toLocaleDateString()}</Text>
                  </Flex>
                </Flex>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme="blue" onClick={() => handleEdit(selectedRecipient)}>
                  Edit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete recipient{' '}
            {recipientToDelete ? `${recipientToDelete.firstName} ${recipientToDelete.lastName}` : ''}?
            This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default RecipientList;