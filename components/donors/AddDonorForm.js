import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  FormErrorMessage,
  Heading,
  Stack,
  Flex,
  SimpleGrid,
  Divider,
  useToast,
  Spinner,
  Text,
  Checkbox,
  HStack
} from '@chakra-ui/react';
import { useRouter } from 'next/router';

const AddDonorForm = ({ existingDonor = null }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const isEditMode = !!existingDonor;

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: existingDonor || {
      firstName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
      bloodType: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      status: 'Active',
      communicationPreferences: {
        email: true,
        sms: true,
        phone: true,
        post: false
      },
      notes: ''
    }
  });

  const communicationPreferences = watch('communicationPreferences');

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Format date of birth
      if (data.dateOfBirth) {
        data.dateOfBirth = new Date(data.dateOfBirth).toISOString();
      }
      
      // API endpoint and method based on mode (edit or add)
      const url = isEditMode ? `/api/donors/${existingDonor._id}` : '/api/donors';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }
      
      // Success message and navigation
      toast({
        title: isEditMode ? 'Donor Updated' : 'Donor Added',
        description: isEditMode 
          ? `${data.firstName} ${data.lastName}'s information has been updated.`
          : `${data.firstName} ${data.lastName} has been added as a donor successfully.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      if (!isEditMode) {
        reset(); // Reset form if adding new donor
      }
      
      // Navigate back to donors list
      router.push('/donors');
      
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>
        {isEditMode ? 'Edit Donor' : 'Add New Donor'}
      </Heading>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={6}>
          {/* Personal Information */}
          <Box>
            <Heading size="md" mb={4}>Personal Information</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isInvalid={errors.firstName}>
                <FormLabel>First Name</FormLabel>
                <Input
                  {...register('firstName', {
                    required: 'First name is required',
                  })}
                />
                <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.lastName}>
                <FormLabel>Last Name</FormLabel>
                <Input
                  {...register('lastName', {
                    required: 'Last name is required',
                  })}
                />
                <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.gender}>
                <FormLabel>Gender</FormLabel>
                <Select
                  placeholder="Select gender"
                  {...register('gender', {
                    required: 'Gender is required',
                  })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
                <FormErrorMessage>{errors.gender?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.dateOfBirth}>
                <FormLabel>Date of Birth</FormLabel>
                <Input
                  type="date"
                  {...register('dateOfBirth', {
                    required: 'Date of birth is required',
                  })}
                />
                <FormErrorMessage>{errors.dateOfBirth?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.bloodType}>
                <FormLabel>Blood Type</FormLabel>
                <Select
                  placeholder="Select blood type"
                  {...register('bloodType', {
                    required: 'Blood type is required',
                  })}
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
              
              <FormControl isInvalid={errors.status}>
                <FormLabel>Status</FormLabel>
                <Select
                  {...register('status', {
                    required: 'Status is required',
                  })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Deferred">Deferred</option>
                </Select>
                <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
          </Box>
          
          <Divider />
          
          {/* Contact Information */}
          <Box>
            <Heading size="md" mb={4}>Contact Information</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isInvalid={errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.phone}>
                <FormLabel>Phone</FormLabel>
                <Input
                  {...register('phone', {
                    required: 'Phone number is required',
                  })}
                />
                <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
              </FormControl>
              
              <Box gridColumn={{ md: 'span 2' }}>
                <Heading size="sm" mb={2}>Communication Preferences</Heading>
                <HStack spacing={4} wrap="wrap">
                  <Checkbox
                    isChecked={communicationPreferences?.email}
                    onChange={(e) => setValue('communicationPreferences.email', e.target.checked)}
                  >
                    Email
                  </Checkbox>
                  <Checkbox
                    isChecked={communicationPreferences?.sms}
                    onChange={(e) => setValue('communicationPreferences.sms', e.target.checked)}
                  >
                    SMS
                  </Checkbox>
                  <Checkbox
                    isChecked={communicationPreferences?.phone}
                    onChange={(e) => setValue('communicationPreferences.phone', e.target.checked)}
                  >
                    Phone
                  </Checkbox>
                  <Checkbox
                    isChecked={communicationPreferences?.post}
                    onChange={(e) => setValue('communicationPreferences.post', e.target.checked)}
                  >
                    Postal Mail
                  </Checkbox>
                </HStack>
              </Box>
            </SimpleGrid>
          </Box>
          
          <Divider />
          
          {/* Address */}
          <Box>
            <Heading size="md" mb={4}>Address</Heading>
            <Stack spacing={4}>
              <FormControl isInvalid={errors.address?.street}>
                <FormLabel>Street</FormLabel>
                <Input
                  {...register('address.street', {
                    required: 'Street is required',
                  })}
                />
                <FormErrorMessage>{errors.address?.street?.message}</FormErrorMessage>
              </FormControl>
              
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <FormControl isInvalid={errors.address?.city}>
                  <FormLabel>City</FormLabel>
                  <Input
                    {...register('address.city', {
                      required: 'City is required',
                    })}
                  />
                  <FormErrorMessage>{errors.address?.city?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.address?.state}>
                  <FormLabel>State/Province</FormLabel>
                  <Input
                    {...register('address.state', {
                      required: 'State is required',
                    })}
                  />
                  <FormErrorMessage>{errors.address?.state?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.address?.zipCode}>
                  <FormLabel>Zip/Postal Code</FormLabel>
                  <Input
                    {...register('address.zipCode', {
                      required: 'Zip code is required',
                    })}
                  />
                  <FormErrorMessage>{errors.address?.zipCode?.message}</FormErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={errors.address?.country}>
                  <FormLabel>Country</FormLabel>
                  <Input
                    {...register('address.country', {
                      required: 'Country is required',
                    })}
                  />
                  <FormErrorMessage>{errors.address?.country?.message}</FormErrorMessage>
                </FormControl>
              </SimpleGrid>
            </Stack>
          </Box>
          
          <Divider />
          
          {/* Emergency Contact */}
          <Box>
            <Heading size="md" mb={4}>Emergency Contact</Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isInvalid={errors.emergencyContact?.name}>
                <FormLabel>Name</FormLabel>
                <Input
                  {...register('emergencyContact.name', {
                    required: 'Emergency contact name is required',
                  })}
                />
                <FormErrorMessage>{errors.emergencyContact?.name?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.emergencyContact?.relationship}>
                <FormLabel>Relationship</FormLabel>
                <Input
                  {...register('emergencyContact.relationship', {
                    required: 'Relationship is required',
                  })}
                />
                <FormErrorMessage>{errors.emergencyContact?.relationship?.message}</FormErrorMessage>
              </FormControl>
              
              <FormControl isInvalid={errors.emergencyContact?.phone}>
                <FormLabel>Phone</FormLabel>
                <Input
                  {...register('emergencyContact.phone', {
                    required: 'Phone number is required',
                  })}
                />
                <FormErrorMessage>{errors.emergencyContact?.phone?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>
          </Box>
          
          <Divider />
          
          {/* Additional Notes */}
          <Box>
            <Heading size="md" mb={4}>Additional Notes</Heading>
            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                {...register('notes')}
                placeholder="Enter any additional notes or relevant information"
                rows={4}
              />
            </FormControl>
          </Box>
          
          {/* Form Submission */}
          <Flex justify="space-between" pt={4}>
            <Button
              onClick={() => router.push('/donors')}
              colorScheme="gray"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              {isEditMode ? 'Update Donor' : 'Add Donor'}
            </Button>
          </Flex>
        </Stack>
      </form>
      
      {isSubmitting && (
        <Flex justify="center" align="center" mt={6}>
          <Spinner mr={2} />
          <Text>{isEditMode ? 'Updating donor...' : 'Adding donor...'}</Text>
        </Flex>
      )}
    </Box>
  );
};

export default AddDonorForm;