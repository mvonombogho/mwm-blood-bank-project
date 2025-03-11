import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Container,
  Icon
} from '@chakra-ui/react';
import { FaLock } from 'react-icons/fa';
import NextLink from 'next/link';
import { useSession } from 'next-auth/react';

export default function AccessDeniedPage() {
  const { data: session } = useSession();
  
  return (
    <Container maxW="container.md" py={20}>
      <Box 
        p={8} 
        bg={useColorModeValue('white', 'gray.800')} 
        shadow="md" 
        borderRadius="lg"
        textAlign="center"
      >
        <VStack spacing={6}>
          <Icon as={FaLock} boxSize={20} color="red.500" />
          
          <Heading as="h1" size="xl">
            Access Denied
          </Heading>
          
          <Text fontSize="lg">
            You don't have permission to access this page.
          </Text>
          
          {session && (
            <Text color="gray.500">
              Your current role is <strong>{session.user.role}</strong>, which doesn't have
              sufficient privileges for this resource.
            </Text>
          )}
          
          <Box pt={4}>
            <NextLink href="/" passHref>
              <Button as="a" colorScheme="red" size="lg">
                Go to Dashboard
              </Button>
            </NextLink>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
}
