import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
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
  Spinner,
  Text,
  useToast,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import axios from 'axios';

const DonorsPage = () => {
  const router = useRouter();
  const toast = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Simplified version without pagination and filtering
  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/donors');
      setDonors(response.data.donors || []);
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
      
      <Flex mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Search donors" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </Flex>
      
      {loading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : donors.length === 0 ? (
        <Box textAlign="center" py={10} bg="gray.50" borderRadius="md">
          <Text fontSize="lg" color="gray.600">
            No donors found. Add your first donor to get started.
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
        <Box>
          <Text>Total Donors: {donors.length}</Text>
          {/* Simple rendering for now - will expand later */}
          {donors.map(donor => (
            <Box 
              key={donor._id} 
              p={4} 
              mb={2} 
              borderWidth="1px" 
              borderRadius="md"
              _hover={{ bg: 'gray.50', cursor: 'pointer' }}
              onClick={() => router.push(`/donors/${donor._id}`)}
            >
              <Text fontWeight="bold">{donor.firstName} {donor.lastName}</Text>
              <Text>Blood Type: {donor.bloodType}</Text>
              <Text>Phone: {donor.phone}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default DonorsPage;