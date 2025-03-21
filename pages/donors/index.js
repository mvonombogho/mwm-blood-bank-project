import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Text,
  Spinner,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ChevronLeftIcon, ChevronRightIcon, EditIcon, ViewIcon, DeleteIcon, SettingsIcon } from '@chakra-ui/icons';
import axios from 'axios';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

const DonorsPage = () => {
  const router = useRouter();
  const toast = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  
  // Alert dialog for delete confirmation
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [donorToDelete, setDonorToDelete] = useState(null);
  const cancelRef = React.useRef();

  // Fetch donors on initial load and when search/filters/pagination changes
  useEffect(() => {
    fetchDonors();
  }, [search, bloodTypeFilter, statusFilter, pagination.page]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      
      if (search) params.search = search;
      if (bloodTypeFilter) params.bloodType = bloodTypeFilter;
      if (statusFilter) params.status = statusFilter;
      
      const response = await axios.get('/api/donors', { params });
      
      setDonors(response.data.donors);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching donors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load donors',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  const handleBloodTypeFilter = (e) => {
    setBloodTypeFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const confirmDelete = (donor) => {
    setDonorToDelete(donor);
    onOpen();
  };

  const handleDelete = async () => {
    if (!donorToDelete) return;
    
    try {
      await axios.delete(`/api/donors/${donorToDelete._id}`);
      
      toast({
        title: 'Donor deleted',
        description: `${donorToDelete.firstName} ${donorToDelete.lastName} has been removed`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Refresh the list
      fetchDonors();
    } catch (error) {
      console.error('Error deleting donor:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete donor',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
      setDonorToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusProps = {
      active: { colorScheme: 'green', text: 'Active' },
      pending: { colorScheme: 'yellow', text: 'Pending' },
      deferred: { colorScheme: 'orange', text: 'Deferred' },
      ineligible: { colorScheme: 'red', text: 'Ineligible' },
    };
    
    const { colorScheme, text } = statusProps[status] || { colorScheme: 'gray', text: status };
    
    return (
      <Badge colorScheme={colorScheme} borderRadius="full" px={2}>
        {text}
      </Badge>
    );
  };

  return (
    <Container maxW="container.xl" py={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Donors</Heading>
        <Button 
          leftIcon={<AddIcon />} 
          colorScheme="blue" 
          onClick={() => router.push('/donors/add')}
        >
          Add Donor
        </Button>
      </Flex>
      
      <Flex direction={{ base: 'column', md: 'row' }} mb={6} gap={4}>
        <InputGroup flex="3">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search donors by name, email, phone, or donor ID" 
            value={search}
            onChange={handleSearch}
          />
        </InputGroup>
        
        <Select 
          placeholder="Blood Type" 
          value={bloodTypeFilter}
          onChange={handleBloodTypeFilter}
          flex="1"
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
        
        <Select 
          placeholder="Status" 
          value={statusFilter}
          onChange={handleStatusFilter}
          flex="1"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="deferred">Deferred</option>
          <option value="ineligible">Ineligible</option>
        </Select>
      </Flex>
      
      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : donors.length === 0 ? (
        <Box textAlign="center" py={10} bg="gray.50" borderRadius="md">
          <Text fontSize="lg" color="gray.600">
            No donors found. Try adjusting your search or filters.
          </Text>
          <Button
            mt={4}
            colorScheme="blue"
            onClick={() => router.push('/donors/add')}
            leftIcon={<AddIcon />}
          >
            Add a Donor
          </Button>
        </Box>
      ) : (
        <>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Donor ID</Th>
                  <Th>Name</Th>
                  <Th>Blood Type</Th>
                  <Th>Gender</Th>
                  <Th>Phone</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {donors.map(donor => (
                  <Tr key={donor._id} _hover={{ bg: 'gray.50' }}>
                    <Td>{donor.donorId || '-'}</Td>
                    <Td>
                      <Text fontWeight="medium">{donor.firstName} {donor.lastName}</Text>
                      <Text fontSize="sm" color="gray.600">{donor.email}</Text>
                    </Td>
                    <Td>{donor.bloodType}</Td>
                    <Td>{donor.gender.charAt(0).toUpperCase() + donor.gender.slice(1)}</Td>
                    <Td>{donor.phone}</Td>
                    <Td>{getStatusBadge(donor.status)}</Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<SettingsIcon />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem 
                            icon={<ViewIcon />}
                            onClick={() => router.push(`/donors/${donor._id}`)}
                          >
                            View Details
                          </MenuItem>
                          <MenuItem 
                            icon={<EditIcon />}
                            onClick={() => router.push(`/donors/edit/${donor._id}`)}
                          >
                            Edit
                          </MenuItem>
                          <MenuItem 
                            icon={<DeleteIcon />}
                            color="red.500"
                            onClick={() => confirmDelete(donor)}
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <Flex justify="center" mt={6}>
              <HStack spacing={2}>
                <IconButton
                  icon={<ChevronLeftIcon />}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  isDisabled={pagination.page === 1}
                  aria-label="Previous Page"
                  size="sm"
                />
                
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant={pagination.page === i + 1 ? "solid" : "outline"}
                    colorScheme={pagination.page === i + 1 ? "blue" : "gray"}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <IconButton
                  icon={<ChevronRightIcon />}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  isDisabled={pagination.page === pagination.pages}
                  aria-label="Next Page"
                  size="sm"
                />
              </HStack>
            </Flex>
          )}
        </>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Donor
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {donorToDelete?.firstName} {donorToDelete?.lastName}? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

// Wrap with protected route
export default function DonorsPageWithAuth() {
  return (
    <ProtectedRoute requiredPermission="canManageDonors">
      <DonorsPage />
    </ProtectedRoute>
  );
}