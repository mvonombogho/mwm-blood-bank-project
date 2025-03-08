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

const DonorList = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [donorToDelete, setDonorToDelete] = useState(null);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/donors');
      if (!response.ok) {
        throw new Error('Failed to fetch donors');
      }
      const data = await response.json();
      setDonors(data);
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

  const handleDeleteClick = (donor) => {
    setDonorToDelete(donor);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/donors/${donorToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete donor');
      }

      // Remove the deleted donor from the state
      setDonors(donors.filter(d => d._id !== donorToDelete._id));
      
      toast({
        title: 'Success',
        description: 'Donor deleted successfully',
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
      setDonorToDelete(null);
    }
  };

  const handleViewDetails = (donor) => {
    setSelectedDonor(donor);
    onOpen();
  };

  const handleEdit = (donor) => {
    router.push(`/donors/edit/${donor._id}`);
  };

  const handleViewDonorPage = (donor) => {
    router.push(`/donors/${donor._id}`);
  };

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = 
      donor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.donorId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBloodType = bloodTypeFilter === '' || donor.bloodType === bloodTypeFilter;
    const matchesStatus = statusFilter === '' || donor.status === statusFilter;
    
    return matchesSearch && matchesBloodType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active':
        return <Badge colorScheme="green">{status}</Badge>;
      case 'Deferred':
        return <Badge colorScheme="orange">{status}</Badge>;
      case 'Inactive':
        return <Badge colorScheme="gray">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateDaysSinceLastDonation = (lastDonationDate) => {
    if (!lastDonationDate) return null;
    
    const lastDonation = new Date(lastDonationDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDonation);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getEligibilityStatus = (donor) => {
    if (donor.status !== 'Active') {
      return <Badge colorScheme="red">Not Eligible</Badge>;
    }
    
    const daysSinceLastDonation = calculateDaysSinceLastDonation(donor.lastDonationDate);
    
    // If no previous donation or it's been more than 56 days (8 weeks)
    if (!daysSinceLastDonation || daysSinceLastDonation >= 56) {
      return <Badge colorScheme="green">Eligible</Badge>;
    } else {
      return <Badge colorScheme="yellow">Wait {56 - daysSinceLastDonation} days</Badge>;
    }
  };

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Donors</Heading>
        <Link href="/donors/add" passHref>
          <Button leftIcon={<AddIcon />} colorScheme="blue">
            Add Donor
          </Button>
        </Link>
      </Flex>
      
      <Flex mb={6} gap={4} flexDir={{ base: 'column', md: 'row' }}>
        <Box flex="1">
          <Input
            placeholder="Search by name, ID, or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<SearchIcon />}
          />
        </Box>
        <Box width={{ base: 'full', md: '200px' }}>
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
        <Box width={{ base: 'full', md: '200px' }}>
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Deferred">Deferred</option>
            <option value="Inactive">Inactive</option>
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
                <Th>Eligibility</Th>
                <Th>Last Donation</Th>
                <Th>Donations</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredDonors.length === 0 ? (
                <Tr>
                  <Td colSpan={8} textAlign="center">No donors found</Td>
                </Tr>
              ) : (
                filteredDonors.map((donor) => (
                  <Tr key={donor._id}>
                    <Td>{donor.donorId}</Td>
                    <Td>{donor.firstName} {donor.lastName}</Td>
                    <Td>
                      <Badge colorScheme={donor.bloodType?.includes('-') ? 'purple' : 'red'}>
                        {donor.bloodType}
                      </Badge>
                    </Td>
                    <Td>{getStatusBadge(donor.status)}</Td>
                    <Td>{getEligibilityStatus(donor)}</Td>
                    <Td>
                      {donor.lastDonationDate 
                        ? new Date(donor.lastDonationDate).toLocaleDateString()
                        : 'Never'
                      }
                    </Td>
                    <Td>{donor.donationCount || 0}</Td>
                    <Td>
                      <Flex gap={2}>
                        <Tooltip label="View Details">
                          <IconButton
                            icon={<ViewIcon />}
                            size="sm"
                            aria-label="View donor details"
                            onClick={() => handleViewDonorPage(donor)}
                          />
                        </Tooltip>
                        <Tooltip label="Edit">
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            aria-label="Edit donor"
                            onClick={() => handleEdit(donor)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete">
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            aria-label="Delete donor"
                            onClick={() => handleDeleteClick(donor)}
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
      
      {/* Quick View Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          {selectedDonor && (
            <>
              <ModalHeader>
                Donor Details: {selectedDonor.firstName} {selectedDonor.lastName}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Flex flexDirection="column" gap={3}>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Donor ID:</Text>
                    <Text>{selectedDonor.donorId}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Blood Type:</Text>
                    <Badge colorScheme={selectedDonor.bloodType?.includes('-') ? 'purple' : 'red'}>
                      {selectedDonor.bloodType}
                    </Badge>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Status:</Text>
                    {getStatusBadge(selectedDonor.status)}
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Eligibility:</Text>
                    {getEligibilityStatus(selectedDonor)}
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Date of Birth:</Text>
                    <Text>{new Date(selectedDonor.dateOfBirth).toLocaleDateString()}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Gender:</Text>
                    <Text>{selectedDonor.gender}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Email:</Text>
                    <Text>{selectedDonor.email || 'N/A'}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Phone:</Text>
                    <Text>{selectedDonor.phone}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Address:</Text>
                    <Text>
                      {selectedDonor.address?.street}, {selectedDonor.address?.city}, {selectedDonor.address?.state} {selectedDonor.address?.zipCode}, {selectedDonor.address?.country}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Donation Count:</Text>
                    <Text>{selectedDonor.donationCount || 0}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Last Donation:</Text>
                    <Text>
                      {selectedDonor.lastDonationDate 
                        ? new Date(selectedDonor.lastDonationDate).toLocaleDateString() 
                        : 'Never'}
                    </Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold" width="150px">Registration Date:</Text>
                    <Text>{new Date(selectedDonor.registrationDate).toLocaleDateString()}</Text>
                  </Flex>
                </Flex>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme="blue" onClick={() => {
                  onClose();
                  handleViewDonorPage(selectedDonor);
                }}>
                  View Full Profile
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
            Are you sure you want to delete donor{' '}
            {donorToDelete ? `${donorToDelete.firstName} ${donorToDelete.lastName}` : ''}?
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

export default DonorList;