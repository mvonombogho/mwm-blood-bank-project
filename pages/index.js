import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const [stats, setStats] = useState({
    donors: 0,
    recipients: 0,
    bloodUnits: {
      total: 0,
      available: 0,
      byType: {}
    }
  });
  
  const router = useRouter();

  // In a real implementation, this would fetch data from the API
  // For now we'll use mock data
  useEffect(() => {
    setStats({
      donors: 124,
      recipients: 87,
      bloodUnits: {
        total: 312,
        available: 245,
        byType: {
          'A+': 67,
          'A-': 18,
          'B+': 42,
          'B-': 14,
          'AB+': 12,
          'AB-': 7,
          'O+': 75,
          'O-': 28
        }
      }
    });
  }, []);

  return (
    <Box>
      {/* Hero section */}
      <Container maxW={'3xl'}>
        <Stack
          as={Box}
          textAlign={'center'}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}>
          <Heading
            fontWeight={600}
            fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
            lineHeight={'110%'}>
            Blood Bank <br />
            <Text as={'span'} color={'blue.400'}>
              Management System
            </Text>
          </Heading>
          <Text color={'gray.500'}>
            A comprehensive system designed to help blood banks manage donations and distributions effectively. 
            Track donors, blood inventory, and recipients in a simple and organized way.
          </Text>
          <Stack
            direction={'column'}
            spacing={3}
            align={'center'}
            alignSelf={'center'}
            position={'relative'}>
            <Button
              colorScheme={'blue'}
              bg={'blue.400'}
              rounded={'full'}
              px={6}
              _hover={{
                bg: 'blue.500',
              }}
              onClick={() => router.push('/recipients')}>
              Manage Recipients
            </Button>
            <Button 
              variant={'link'} 
              colorScheme={'blue'} 
              size={'sm'}
              onClick={() => router.push('/donors')}>
              View Donors
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Stats section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} p={10}>
        <Container maxW={'7xl'}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 5, lg: 8 }}>
            <StatsCard
              title={'Donors'}
              stat={stats.donors}
              helpText={'Active blood donors'}
              onClick={() => router.push('/donors')}
            />
            <StatsCard
              title={'Recipients'}
              stat={stats.recipients}
              helpText={'Registered recipients'}
              onClick={() => router.push('/recipients')}
            />
            <StatsCard
              title={'Blood Units'}
              stat={stats.bloodUnits.available}
              helpText={`of ${stats.bloodUnits.total} total units`}
              onClick={() => router.push('/inventory/blood-units')}
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Blood Inventory section */}
      <Box p={10}>
        <Container maxW={'7xl'}>
          <Heading as="h2" size="xl" mb={6} textAlign="center">
            Available Blood Inventory
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4, lg: 8 }} spacing={5}>
            {Object.entries(stats.bloodUnits.byType).map(([type, count]) => (
              <Box
                key={type}
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow={'lg'}
                rounded={'lg'}
                p={6}
                textAlign={'center'}
                borderWidth={1}
                borderColor={type.includes('-') ? 'purple.100' : 'red.100'}
              >
                <Badge
                  px={3}
                  py={1}
                  mb={3}
                  fontSize="xl"
                  fontWeight="bold"
                  colorScheme={type.includes('-') ? 'purple' : 'red'}
                  borderRadius="full"
                >
                  {type}
                </Badge>
                <Text fontSize="4xl" fontWeight="bold">
                  {count}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  units available
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Features section */}
      <Box bg={useColorModeValue('gray.50', 'gray.900')} p={10}>
        <Container maxW={'7xl'}>
          <Heading as="h2" size="xl" mb={6} textAlign="center">
            System Features
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            <Feature
              title={'Donor Management'}
              text={'Track donor information, donation history, and eligibility status.'}
            />
            <Feature
              title={'Inventory Control'}
              text={'Monitor blood units, expiry dates, and storage conditions.'}
            />
            <Feature
              title={'Recipient Records'}
              text={'Manage recipient data, transfusion history, and blood requests.'}
            />
            <Feature
              title={'Reporting'}
              text={'Generate insights with comprehensive reports and analytics.'}
            />
          </SimpleGrid>
        </Container>
      </Box>

    </Box>
  );
}

const StatsCard = ({ title, stat, helpText, onClick }) => {
  return (
    <Stat
      px={{ base: 4, md: 8 }}
      py={'5'}
      shadow={'xl'}
      border={'1px solid'}
      borderColor={useColorModeValue('gray.800', 'gray.500')}
      rounded={'lg'}
      onClick={onClick}
      cursor="pointer"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'xl',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <StatLabel fontWeight={'medium'} isTruncated>
        {title}
      </StatLabel>
      <StatNumber fontSize={'2xl'} fontWeight={'medium'}>
        {stat}
      </StatNumber>
      <StatHelpText>{helpText}</StatHelpText>
    </Stat>
  );
};

const Feature = ({ title, text }) => {
  return (
    <Stack>
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        color={'white'}
        rounded={'full'}
        bg={'blue.500'}
        mb={1}>
        <Icon as={CheckIcon} w={10} h={10} />
      </Flex>
      <Text fontWeight={600}>{title}</Text>
      <Text color={'gray.600'}>{text}</Text>
    </Stack>
  );
};