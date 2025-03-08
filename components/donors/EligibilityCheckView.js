import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Flex,
  Text,
  Badge,
  Button,
  Spinner,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  HStack,
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon, TimeIcon } from '@chakra-ui/icons';

const EligibilityCheckView = ({ donorId }) => {
  const [eligibilityData, setEligibilityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  useEffect(() => {
    if (donorId) {
      fetchEligibilityStatus();
    }
  }, [donorId]);

  const fetchEligibilityStatus = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would be an API call to fetch donor eligibility:
      // const response = await fetch(`/api/donors/status?donorId=${donorId}`);
      // if (!response.ok) {
      //   throw new Error('Failed to fetch eligibility status');
      // }
      // const data = await response.json();
      // setEligibilityData(data.data);
      
      // For now, simulate with mock data
      const mockEligibility = {
        donor: {
          _id: '123456789',
          donorId: 'D230001',
          firstName: 'John',
          lastName: 'Doe',
          bloodType: 'O+',
          status: 'Active',
          donationCount: 5,
          lastDonationDate: new Date('2023-01-15').toISOString()
        },
        eligibility: {
          isEligible: true,
          reason: null,
          nextEligibleDate: null
        },
        healthStatus: {
          lastAssessment: new Date('2023-01-15').toISOString(),
          status: 'Eligible',
          permanentlyDeferred: false,
          latestParameters: {
            weight: 75,
            height: 178,
            bmi: 23.7,
            bloodPressure: {
              systolic: 118,
              diastolic: 75
            },
            pulse: 72,
            temperature: 36.6,
            hemoglobin: 14.5,
            status: 'Normal'
          }
        },
        activeDeferral: null,
        donationMetrics: {
          totalDonations: 5,
          daysSinceLastDonation: 78,
          intervalCompliance: true
        }
      };
      
      // Simulate loading time
      setTimeout(() => {
        setEligibilityData(mockEligibility);
        setIsLoading(false);
      }, 600);
      
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