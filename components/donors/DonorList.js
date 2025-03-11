import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Select,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, EditIcon, ViewIcon, DeleteIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useRouter } from 'next/router';

const DonorList = () => {
  const toast = useToast();
  const router = useRouter();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchDonors = async (page = 1) => {
    try {
      setLoading(true);
      
      let url = `/api/donors?page=${page}&limit=${pagination.limit}`;
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      
      if (bloodTypeFilter) {
        url += `&bloodType=${encodeURIComponent(bloodTypeFilter)}`;
      }
      
      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }
      
      const response = await axios.get(url);
      
      setDonors(response.data.donors);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({
        title: 'Error fetching donors',
        description: error.response?.data?.message || 'Could not load donor data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors(pagination.page);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDonors(1); // Reset to first page when searching
  };

  const handleBloodTypeChange = (e) => {
    setBloodTypeFilter(e.target.value);
    fetchDonors(1); // Reset to first page when filter changes
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    fetchDonors(1); // Reset to first page when filter changes
  };

  const handlePageChange = (newPage) => {
    fetchDonors(newPage);
  };

  const handleViewDonor = (donorId) => {
    router.push(`/donors/${donorId}`);
  };

  const handleEditDonor = (donorId) => {
    router.push(`/donors/${donorId}/edit`);
  };

  const handleDeleteDonor = async (donorId, donorName) => {
    if (window.confirm(`Are you sure you want to delete donor ${donorName}?`)) {
      try {
        await axios.delete(`/api/donors/${donorId}`);
        
        toast({
          title: 'Donor deleted',
          description: `Donor ${donorName} has been deleted`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Refresh the donor list
        fetchDonors(pagination.page);
      } catch (error) {
        toast({
          title: 'Error deleting donor',
          description: error.response?.data?.message || 'Could not delete donor',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'deferred': return 'orange';
      case 'ineligible': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };
  
  return (
    <Box>
      <Flex direction={{ base: 'column', md: 'row' }} mb={5} gap={3} justify="space-between">
        <Box flex="1">
          <form onSubmit={handleSearch}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search by name, email or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
          </form>
        </Box>
        
        <Stack direction={{ base: 'column', sm: 'row' }} spacing={3}>
          <Select
            placeholder="All Blood Types"
            value={bloodTypeFilter}
            onChange={handleBloodTypeChange}
            width={{ base: 'full', md: '150px' }}
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
          
          <Select
            placeholder="All Status"
            value={statusFilter}
            onChange={handleStatusChange}
            width={{ base: 'full', md: '150px' }}
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="deferred">Deferred</option>
            <option value="ineligible">Ineligible</option>
          </Select>
          
          <Button colorScheme="blue" onClick={() => router.push('/donors/add')}>
            Add Donor
          </Button>
        </Stack>
      </Flex>

      {donors.length > 0 ? (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Blood Type</Th>
                <Th>Contact Info</Th>
                <Th>Status</Th>
                <Th>Last Donation</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {donors.map((donor) => (
                <Tr key={donor._id}>
                  <Td>
                    <Text fontWeight="medium">{donor.firstName} {donor.lastName}</Text>
                    <Text fontSize="sm" color="gray.500">ID: {donor.donorId}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="red" fontSize="0.9em" p="1">
                      {donor.bloodType}
                    </Badge>
                  </Td>
                  <Td>
                    <Text>{donor.email}</Text>
                    <Text color="gray.600">{donor.phone}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusBadgeColor(donor.status)} p="1">
                      {donor.status}
                    </Badge>
                  </Td>
                  <Td>
                    {donor.lastDonation ? new Date(donor.lastDonation).toLocaleDateString() : 'Never'}
                  </Td>
                  <Td>
                    <IconButton
                      icon={<ViewIcon />}
                      aria-label="View donor"
                      size="sm"
                      mr={2}
                      onClick={() => handleViewDonor(donor._id)}
                    />
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit donor"
                      size="sm"
                      mr={2}
                      onClick={() => handleEditDonor(donor._id)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete donor"
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDeleteDonor(donor._id, `${donor.firstName} ${donor.lastName}`)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
          
          {/* Pagination */}
          <Flex justify="space-between" align="center" mt={4}>
            <Text color="gray.600">
              Showing {donors.length} of {pagination.total} donors
            </Text>
            <Stack direction="row" spacing={2}>
              <Button
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                isDisabled={pagination.page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                isDisabled={pagination.page >= pagination.pages || loading}
              >
                Next
              </Button>
            </Stack>
          </Flex>
        </Box>
      ) : (
        <Alert status="info">
          <AlertIcon />
          {loading ? 'Loading donors...' : 'No donors found matching your criteria'}
        </Alert>
      )}
    </Box>
  );
};

export default DonorList;
