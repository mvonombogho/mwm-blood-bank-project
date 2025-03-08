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
  useDisclosure,
  Table,
  Tbody,
  Tr,
  Td
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

  const getEligibilityStatus = () => {
    if (!eligibilityData) return null;
    
    if (eligibilityData.eligibility.isEligible) {
      return (
        <Alert
          status="success"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Eligible to Donate
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            This donor is currently eligible to donate blood. All eligibility criteria have been met.
          </AlertDescription>
        </Alert>
      );
    } else {
      return (
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Not Eligible to Donate
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            {eligibilityData.eligibility.reason}
            {eligibilityData.eligibility.nextEligibleDate && (
              <Text mt={2}>
                Next eligible date: {new Date(eligibilityData.eligibility.nextEligibleDate).toLocaleDateString()}
              </Text>
            )}
          </AlertDescription>
        </Alert>
      );
    }
  };

  const calculateTimeToNextDonation = () => {
    if (!eligibilityData || !eligibilityData.donationMetrics.daysSinceLastDonation) return null;
    
    const waitPeriod = 56; // 56 days (8 weeks) standard wait period
    const daysPassed = eligibilityData.donationMetrics.daysSinceLastDonation;
    
    if (daysPassed >= waitPeriod) {
      return { 
        daysLeft: 0, 
        percentage: 100, 
        isComplete: true 
      };
    } else {
      const daysLeft = waitPeriod - daysPassed;
      const percentage = Math.round((daysPassed / waitPeriod) * 100);
      
      return { 
        daysLeft, 
        percentage, 
        isComplete: false 
      };
    }
  };

  const timeToNextDonation = calculateTimeToNextDonation();

  const handleCheckEligibility = () => {
    onOpen();
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="md">Donor Eligibility</Heading>
        <Button 
          colorScheme="blue" 
          size="sm"
          onClick={handleCheckEligibility}
          leftIcon={<Icon as={CheckCircleIcon} />}
        >
          Check Eligibility
        </Button>
      </Flex>
      
      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : error ? (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : eligibilityData ? (
        <VStack spacing={6} align="stretch">
          {getEligibilityStatus()}
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card>
              <CardHeader>
                <Heading size="sm">Time Since Last Donation</Heading>
              </CardHeader>
              <CardBody>
                {eligibilityData.donationMetrics.daysSinceLastDonation !== null ? (
                  <Box>
                    <HStack justify="space-between">
                      <Text>Progress to next eligible date:</Text>
                      <Badge colorScheme={timeToNextDonation.isComplete ? "green" : "blue"}>
                        {timeToNextDonation.isComplete ? "Eligible Now" : `${timeToNextDonation.daysLeft} days left`}
                      </Badge>
                    </HStack>
                    <Progress 
                      value={timeToNextDonation.percentage} 
                      colorScheme={timeToNextDonation.isComplete ? "green" : "blue"}
                      mt={2}
                      mb={2}
                      borderRadius="md"
                      hasStripe
                    />
                    <Text fontSize="sm" color="gray.500">
                      {timeToNextDonation.isComplete 
                        ? "Donor has waited the required 56 days since last donation" 
                        : `${eligibilityData.donationMetrics.daysSinceLastDonation} days since last donation. Required wait: 56 days.`
                      }
                    </Text>
                  </Box>
                ) : (
                  <Text>No previous donations recorded</Text>
                )}
              </CardBody>
            </Card>
            
            <Card>
              <CardHeader>
                <Heading size="sm">Donation History</Heading>
              </CardHeader>
              <CardBody>
                <Stat>
                  <StatLabel>Total Donations</StatLabel>
                  <StatNumber>{eligibilityData.donationMetrics.totalDonations}</StatNumber>
                  <StatHelpText>
                    Last donation: {eligibilityData.donor.lastDonationDate 
                      ? new Date(eligibilityData.donor.lastDonationDate).toLocaleDateString() 
                      : 'Never'
                    }
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
          
          {eligibilityData.healthStatus && eligibilityData.healthStatus.latestParameters && (
            <Card>
              <CardHeader>
                <Heading size="sm">Health Parameters</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="sm" color="gray.500" mb={3}>
                  Last assessment: {new Date(eligibilityData.healthStatus.lastAssessment).toLocaleDateString()}
                </Text>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold">Blood Pressure</Text>
                    <Badge colorScheme="green">
                      {eligibilityData.healthStatus.latestParameters.bloodPressure.systolic} / {eligibilityData.healthStatus.latestParameters.bloodPressure.diastolic} mmHg
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Hemoglobin</Text>
                    <Badge colorScheme="green">
                      {eligibilityData.healthStatus.latestParameters.hemoglobin} g/dL
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">BMI</Text>
                    <Badge colorScheme="green">
                      {eligibilityData.healthStatus.latestParameters.bmi}
                    </Badge>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          )}
          
          {eligibilityData.activeDeferral && (
            <Card>
              <CardHeader bg="red.50">
                <Heading size="sm" color="red.500">Active Deferral</Heading>
              </CardHeader>
              <CardBody>
                <VStack align="start" spacing={3}>
                  <Box>
                    <Text fontWeight="bold">Reason:</Text>
                    <Text>{eligibilityData.activeDeferral.deferralReason.specificReason}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Type:</Text>
                    <Badge colorScheme={eligibilityData.activeDeferral.deferralType === 'Permanent' ? 'red' : 'orange'}>
                      {eligibilityData.activeDeferral.deferralType}
                    </Badge>
                  </Box>
                  {eligibilityData.activeDeferral.deferralType !== 'Permanent' && eligibilityData.activeDeferral.deferralPeriod.endDate && (
                    <Box>
                      <Text fontWeight="bold">End Date:</Text>
                      <Text>{new Date(eligibilityData.activeDeferral.deferralPeriod.endDate).toLocaleDateString()}</Text>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      ) : null}
      
      {/* Eligibility Check Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Eligibility Check</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {eligibilityData ? (
              <VStack spacing={4} align="stretch">
                <Heading size="md">
                  {eligibilityData.eligibility.isEligible 
                    ? 'Donor is eligible to donate' 
                    : 'Donor is not eligible to donate'
                  }
                </Heading>
                
                <Box p={4} bg={eligibilityData.eligibility.isEligible ? 'green.50' : 'red.50'} borderRadius="md">
                  <Flex align="center" gap={2}>
                    <Icon 
                      as={eligibilityData.eligibility.isEligible ? CheckCircleIcon : WarningIcon} 
                      color={eligibilityData.eligibility.isEligible ? 'green.500' : 'red.500'} 
                      boxSize={5}
                    />
                    <Text fontWeight="bold">
                      {eligibilityData.eligibility.isEligible 
                        ? 'All eligibility criteria are met' 
                        : eligibilityData.eligibility.reason
                      }
                    </Text>
                  </Flex>
                </Box>
                
                <Divider />
                
                <Heading size="sm">Eligibility Criteria</Heading>
                
                <Table variant="simple" size="sm">
                  <Tbody>
                    <Tr>
                      <Td fontWeight="bold">Time Since Last Donation</Td>
                      <Td>{eligibilityData.donationMetrics.daysSinceLastDonation} days</Td>
                      <Td>
                        <Badge colorScheme={eligibilityData.donationMetrics.intervalCompliance ? 'green' : 'red'}>
                          {eligibilityData.donationMetrics.intervalCompliance ? 'Passed' : 'Failed'}
                        </Badge>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Health Status</Td>
                      <Td>{eligibilityData.healthStatus.status}</Td>
                      <Td>
                        <Badge colorScheme={eligibilityData.healthStatus.status === 'Eligible' ? 'green' : 'red'}>
                          {eligibilityData.healthStatus.status === 'Eligible' ? 'Passed' : 'Failed'}
                        </Badge>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Active Deferrals</Td>
                      <Td>{eligibilityData.activeDeferral ? 'Yes' : 'None'}</Td>
                      <Td>
                        <Badge colorScheme={!eligibilityData.activeDeferral ? 'green' : 'red'}>
                          {!eligibilityData.activeDeferral ? 'Passed' : 'Failed'}
                        </Badge>
                      </Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="bold">Donor Status</Td>
                      <Td>{eligibilityData.donor.status}</Td>
                      <Td>
                        <Badge colorScheme={eligibilityData.donor.status === 'Active' ? 'green' : 'red'}>
                          {eligibilityData.donor.status === 'Active' ? 'Passed' : 'Failed'}
                        </Badge>
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
                
                {!eligibilityData.eligibility.isEligible && eligibilityData.eligibility.nextEligibleDate && (
                  <Box p={4} bg="blue.50" borderRadius="md">
                    <Flex align="center" gap={2}>
                      <Icon as={TimeIcon} color="blue.500" boxSize={5} />
                      <Text>
                        Next eligible date: <b>{new Date(eligibilityData.eligibility.nextEligibleDate).toLocaleDateString()}</b>
                      </Text>
                    </Flex>
                  </Box>
                )}
              </VStack>
            ) : (
              <Flex justify="center" py={10}>
                <Spinner />
              </Flex>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EligibilityCheckView;