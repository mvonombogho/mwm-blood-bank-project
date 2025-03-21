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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';
import axios from 'axios';

const DonorForm = ({ donorId = null, initialData = null }) => {
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [formError, setFormError] = useState(null);
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
  const hasConsented = watch('hasConsented');

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
          console.error('Error fetching donor:', error);
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
      setFormError(null);
      
      // Format date properly
      if (data.dateOfBirth) {
        data.dateOfBirth = new Date(data.dateOfBirth).toISOString();
      }
      
      // Convert string values to numbers where needed
      if (data.weight) data.weight = Number(data.weight);
      if (data.height) data.height = Number(data.height);
      
      console.log('Submitting donor data:', data);
      
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
          description: `${data.firstName} ${data.lastName} has been successfully registered as a donor`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      router.push(`/donors/${response.data._id}`);
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Handle different types of errors
      if (error.response?.data?.errors) {
        // Validation errors from the API
        setFormError({
          title: 'Validation Error',
          message: 'Please check the form for errors',
          errors: error.response.data.errors
        });
        
        // Move to the tab with errors
        // This is simplified and would need more logic for a real app
        setTabIndex(0);
      } else {
        // General error
        toast({
          title: `Error ${isEditMode ? 'updating' : 'adding'} donor`,
          description: error.response?.data?.message || `Could not ${isEditMode ? 'update' : 'add'} donor information`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (index) => {
    setTabIndex(index);
  };
  
  const handleNextTab = () => {
    setTabIndex(tabIndex + 1);
  };
  
  const handlePrevTab = () => {
    setTabIndex(tabIndex - 1);
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)} p={4} bg="white" borderRadius="md" boxShadow="sm">
      <Heading size="lg" mb={6}>
        {isEditMode ? 'Edit Donor Information' : 'Register New Donor'}
      </Heading>
      
      {formError && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>{formError.title}</AlertTitle>
            <AlertDescription display="block">
              {formError.message}
              {formError.errors && (
                <ul style={{ marginTop: '8px' }}>
                  {Object.entries(formError.errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Box>
        </Alert>
      )}
      
      <Tabs index={tabIndex} onChange={handleTabChange} colorScheme="blue" variant="enclosed">
        <TabList>
          <Tab>Personal Information</Tab>
          <Tab>Contact Information</Tab>
          <Tab>Health Information</Tab>
          <Tab>Consent & Status</Tab>
        </TabList>
        
        <TabPanels>
          {/* Personal Information Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    <FormControl isRequired isInvalid={!!errors.firstName}>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        {...register('firstName', { required: 'First name is required' })}
                        placeholder="First name"
                      />
                      <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isRequired isInvalid={!!errors.lastName}>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        {...register('lastName', { required: 'Last name is required' })}
                        placeholder="Last name"
                      />
                      <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isRequired isInvalid={!!errors.dateOfBirth}>
                      <FormLabel>Date of Birth</FormLabel>
                      <Input
                        {...register('dateOfBirth', { required: 'Date of birth is required' })}
                        type="date"
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <FormErrorMessage>{errors.dateOfBirth?.message}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isRequired isInvalid={!!errors.gender}>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        {...register('gender', { required: 'Gender is required' })}
                        placeholder="Select gender"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Select>
                      <FormErrorMessage>{errors.gender?.message}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isRequired isInvalid={!!errors.bloodType}>
                      <FormLabel>Blood Type</FormLabel>
                      <Select
                        {...register('bloodType', { required: 'Blood type is required' })}
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
                      <FormErrorMessage>{errors.bloodType?.message}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl>
                      <FormLabel>Occupation</FormLabel>
                      <Input
                        {...register('occupation')}
                        placeholder="Occupation"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
                
                <Box mt={6} textAlign="right">
                  <Button
                    colorScheme="blue"
                    onClick={handleNextTab}
                  >
                    Next: Contact Information
                  </Button>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Contact Information Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    <FormControl isRequired isInvalid={!!errors.email}>
                      <FormLabel>Email</FormLabel>
                      <Input
                        {...register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                            message: 'Invalid email address',
                          } 
                        })}
                        placeholder="Email address"
                        type="email"
                      />
                      <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl isRequired isInvalid={!!errors.phone}>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        {...register('phone', { required: 'Phone number is required' })}
                        placeholder="Phone number"
                        type="tel"
                      />
                      <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem colSpan={{ base: 1, md: 2 }}>
                    <FormControl>
                      <FormLabel>Address</FormLabel>
                      <Textarea
                        {...register('address')}
                        placeholder="Street address"
                        rows={2}
                      />
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl>
                      <FormLabel>City</FormLabel>
                      <Input
                        {...register('city')}
                        placeholder="City"
                      />
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl>
                      <FormLabel>State/Province</FormLabel>
                      <Input
                        {...register('state')}
                        placeholder="State/Province"
                      />
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl>
                      <FormLabel>Postal Code</FormLabel>
                      <Input
                        {...register('postalCode')}
                        placeholder="Postal code"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
                
                <Divider my={6} />
                
                <Box mb={4}>
                  <Heading size="md" mb={4}>Emergency Contact</Heading>
                  
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                    <GridItem>
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input
                          {...register('emergencyContactName')}
                          placeholder="Emergency contact name"
                        />
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl>
                        <FormLabel>Phone</FormLabel>
                        <Input
                          {...register('emergencyContactPhone')}
                          placeholder="Emergency contact phone"
                          type="tel"
                        />
                      </FormControl>
                    </GridItem>
                    
                    <GridItem>
                      <FormControl>
                        <FormLabel>Relationship</FormLabel>
                        <Input
                          {...register('emergencyContactRelationship')}
                          placeholder="Relationship to donor"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
                
                <Box mt={6} textAlign="right">
                  <Button
                    variant="outline"
                    mr={3}
                    onClick={handlePrevTab}
                  >
                    Previous
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleNextTab}
                  >
                    Next: Health Information
                  </Button>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Health Information Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    <FormControl>
                      <FormLabel>Weight (kg)</FormLabel>
                      <NumberInput min={0}>
                        <NumberInputField
                          {...register('weight')}
                          placeholder="Weight in kg"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </GridItem>
                  
                  <GridItem>
                    <FormControl>
                      <FormLabel>Height (cm)</FormLabel>
                      <NumberInput min={0}>
                        <NumberInputField
                          {...register('height')}
                          placeholder="Height in cm"
                        />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </GridItem>
                </Grid>
                
                <Divider my={4} />
                
                <Stack spacing={4} mt={4}>
                  <FormControl>
                    <Checkbox
                      {...register('hasRecentIllness')}
                    >
                      Recent illness or infection in the past 3 months?
                    </Checkbox>
                    
                    {hasRecentIllness && (
                      <Textarea
                        {...register('recentIllnessDetails')}
                        placeholder="Please provide details"
                        mt={2}
                        size="sm"
                      />
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <Checkbox
                      {...register('hasChronicDisease')}
                    >
                      Any chronic disease or long-term health condition?
                    </Checkbox>
                    
                    {hasChronicDisease && (
                      <Textarea
                        {...register('chronicDiseaseDetails')}
                        placeholder="Please provide details"
                        mt={2}
                        size="sm"
                      />
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <Checkbox
                      {...register('isTakingMedication')}
                    >
                      Currently taking any medication?
                    </Checkbox>
                    
                    {isTakingMedication && (
                      <Textarea
                        {...register('medicationDetails')}
                        placeholder="Please provide details"
                        mt={2}
                        size="sm"
                      />
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <Checkbox
                      {...register('hasTraveledRecently')}
                    >
                      Traveled to any high-risk areas in the past 6 months?
                    </Checkbox>
                    
                    {hasTraveledRecently && (
                      <Textarea
                        {...register('travelDetails')}
                        placeholder="Please provide details"
                        mt={2}
                        size="sm"
                      />
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <Checkbox
                      {...register('hasPreviousDonation')}
                    >
                      Donated blood before?
                    </Checkbox>
                    
                    {hasPreviousDonation && (
                      <Textarea
                        {...register('previousDonationDetails')}
                        placeholder="Please provide details (when and where)"
                        mt={2}
                        size="sm"
                      />
                    )}
                  </FormControl>
                </Stack>
                
                <Box mt={6} textAlign="right">
                  <Button
                    variant="outline"
                    mr={3}
                    onClick={handlePrevTab}
                  >
                    Previous
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleNextTab}
                  >
                    Next: Consent & Status
                  </Button>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Consent & Status Tab */}
          <TabPanel>
            <Card>
              <CardBody>
                <Box mb={6}>
                  <Heading size="md" mb={4}>Consent</Heading>
                  <Text mb={4}>
                    I hereby declare that the information provided is true and correct. I agree to donate my blood voluntarily and understand that it will be used for patients in need. I am aware that donating blood is a safe procedure when done under proper medical supervision, and I consent to undergoing the necessary tests and examinations related to blood donation.
                  </Text>
                  
                  <FormControl isRequired isInvalid={!!errors.hasConsented}>
                    <Checkbox
                      {...register('hasConsented', { 
                        required: 'Consent is required to proceed' 
                      })}
                      size="lg"
                      colorScheme="green"
                    >
                      I agree and consent to donate blood
                    </Checkbox>
                    <FormErrorMessage>{errors.hasConsented?.message}</FormErrorMessage>
                  </FormControl>
                </Box>
                
                {isEditMode && (
                  <Box mt={6}>
                    <Heading size="md" mb={4}>Donor Status</Heading>
                    
                    <FormControl isRequired>
                      <FormLabel>Status</FormLabel>
                      <RadioGroup>
                        <Stack direction="row" spacing={5}>
                          <Radio
                            {...register('status')}
                            value="active"
                            colorScheme="green"
                          >
                            Active
                          </Radio>
                          <Radio
                            {...register('status')}
                            value="pending"
                            colorScheme="yellow"
                          >
                            Pending
                          </Radio>
                          <Radio
                            {...register('status')}
                            value="deferred"
                            colorScheme="orange"
                          >
                            Deferred
                          </Radio>
                          <Radio
                            {...register('status')}
                            value="ineligible"
                            colorScheme="red"
                          >
                            Ineligible
                          </Radio>
                        </Stack>
                      </RadioGroup>
                    </FormControl>
                  </Box>
                )}
                
                <Box mt={6} textAlign="right">
                  <Button
                    variant="outline"
                    mr={3}
                    onClick={handlePrevTab}
                  >
                    Previous
                  </Button>
                  <Button
                    colorScheme="blue"
                    type="submit"
                    isLoading={loading}
                    isDisabled={!hasConsented}
                  >
                    {isEditMode ? 'Update Donor' : 'Register Donor'}
                  </Button>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default DonorForm;