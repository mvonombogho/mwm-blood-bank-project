import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Select,
  Stack,
  Textarea,
  VStack,
  Grid,
  GridItem,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Text,
  Checkbox,
  InputGroup,
  InputLeftAddon,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  HStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import axios from 'axios';

const DonorForm = ({ donorId = null, initialData = null }) => {
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const isEditMode = !!donorId;
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isDirty, isValid } } = useForm({
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      bloodType: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      occupation: '',
      // Health Information
      weight: '',
      height: '',
      hasRecentIllness: false,
      recentIllnessDetails: '',
      hasChronicDisease: false,
      chronicDiseaseDetails: '',
      isTakingMedication: false,
      medicationDetails: '',
      hasTraveledRecently: false,
      travelDetails: '',
      hasPreviousDonation: false,
      previousDonationDetails: '',
      status: 'pending',
      // Consent
      hasConsented: false,
    }
  });
  
  const hasRecentIllness = watch('hasRecentIllness');
  const hasChronicDisease = watch('hasChronicDisease');
  const isTakingMedication = watch('isTakingMedication');
  const hasTraveledRecently = watch('hasTraveledRecently');
  const hasPreviousDonation = watch('hasPreviousDonation');

  useEffect(() => {
    if (isEditMode && !initialData) {
      // Fetch donor data if in edit mode and no initialData provided
      const fetchDonor = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/donors/${donorId}`);
          const donorData = response.data;
          
          // Set form values from donor data
          Object.keys(donorData).forEach(key => {
            if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
              setValue(key, donorData[key]);
            }
          });
          
          // Format date for input element
          if (donorData.dateOfBirth) {
            const date = new Date(donorData.dateOfBirth);
            setValue('dateOfBirth', date.toISOString().split('T')[0]);
          }
        } catch (error) {
          toast({
            title: 'Error fetching donor data',
            description: error.response?.data?.message || 'Could not load donor information',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          router.push('/donors');
        } finally {
          setLoading(false);
        }
      };
      
      fetchDonor();
    }
  }, [donorId, initialData, setValue, router, toast, isEditMode]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      let response;
      if (isEditMode) {
        response = await axios.put(`/api/donors/${donorId}`, data);
        toast({
          title: 'Donor updated',
          description: `${data.firstName} ${data.lastName}'s information has been updated`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        response = await axios.post('/api/donors', data);
        toast({
          title: 'Donor added',
          description: `${data.firstName} ${data.lastName} has been added as a donor`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      router.push(`/donors/${response.data._id}`);
    } catch (error) {
      toast({
        title: `Error ${isEditMode ? 'updating' : 'adding'} donor`,
        description: error.response?.data?.message || `Could not ${isEditMode ? 'update' : 'add'} donor information`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
