import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Badge,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  Spinner,
  useToast,
  Select,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage
} from '@chakra-ui/react';
import { AddIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';

const DonationHistoryView = ({ donorId }) => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const toast = useToast();
  const [isEditMode, setIsEditMode] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    if (donorId) {
      fetchDonations();
    }
  }, [donorId]);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      // This would be a real API call in a complete implementation
      // For now, simulate a fetch with mock data
      const mockDonations = [
        {
          donationId: 'BU230301001',
          date: new Date('2023-03-01').toISOString(),
          bloodType: 'O+',
          quantity: 450,
          location: 'Main Blood Center',
          status: 'Transfused',
          notes: 'Routine donation'
        },
        {
          donationId: 'BU221105002',
          date: new Date('2022-11-05').toISOString(),
          bloodType: 'O+',
          quantity: 450,
          location: 'Mobile Drive - City Hall',
          status: 'Transfused',
          notes: 'Mobile blood drive'
        },
        {
          donationId: 'BU220701003',
          date: new Date('2022-07-01').toISOString(),
          bloodType: 'O+',
          quantity: 450,
          location: 'Main Blood Center',
          status: 'Expired',
          notes: 'Routine donation'
        }
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setDonations(mockDonations);
        setIsLoading(false);
      }, 500);
      
      // In a real implementation, this would be:
      // const response = await fetch(`/api/donors/${donorId}/donations`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch donations');
      // }
      // const data = await response.json();
      // setDonations(data);
      // setIsLoading(false);
    } catch (error) {
      setError(error.message);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const handleViewDonation = (donation) => {
    setSelectedDonation(donation);
    onViewOpen();
  };

  const handleAddDonation = () => {
    setIsEditMode(false);
    setSelectedDonation(null);
    reset({
      bloodType: '',
      quantity: 450,
      date: new Date().toISOString().split('T')[0],
      location: '',
      notes: ''
    });
    onFormOpen();
  };

  const handleEditDonation = (donation) => {
    setIsEditMode(true);
    setSelectedDonation(donation);
    
    // Format date for form input
    const formattedDate = donation.date 
      ? new Date(donation.date).toISOString().split('T')[0]
      : '';
    
    reset({
      bloodType: donation.bloodType,
      quantity: donation.quantity,
      date: formattedDate,
      location: donation.location,
      notes: donation.notes
    });
    
    onFormOpen();
  };