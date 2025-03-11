import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  SkeletonText
} from '@chakra-ui/react';
import { EditIcon, AddIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import axios from 'axios';
import NextLink from 'next/link';

const DonorDetail = ({ donorId }) => {
  const toast = useToast();
  const router = useRouter();
  const [donor, setDonor] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setLoading(true);
        const [donorResponse, donationsResponse] = await Promise.all([
          axios.get(`/api/donors/${donorId}`),
          axios.get(`/api/donors/${donorId}/donations`)
        ]);
        
        setDonor(donorResponse.data);
        setDonations(donationsResponse.data);
      } catch (err) {
        console.error('Error fetching donor data:', err);
        setError(err.response?.data?.message || 'Failed to load donor information');
        toast({
          title: 'Error',
          description: 'Failed to load donor information',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    if (donorId) {
      fetchDonorData();
    }
  }, [donorId, toast]);

  const handleEditDonor = () => {
    router.push(`/donors/${donorId}/edit`);
  };

  const handleAddDonation = () => {
    router.push(`/donations/add?donorId=${donorId}`);
  };

  // Function to get color scheme for status badge
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'deferred': return 'orange';
      case 'ineligible': return 'red';
      default: return 'gray';
    }
  };
