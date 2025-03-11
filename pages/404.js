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
import { FaSearch } from 'react-icons/fa';
import NextLink from 'next/link';

export default function NotFoundPage() {
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
          <Icon as={FaSearch} boxSize={20} color="gray.400" />
          
          <Heading as="h1" size="xl">
            404 - Page Not Found
          </Heading>
          
          <Text fontSize="lg">
            The page you are looking for doesn't exist or has been moved.
          </Text>
          
          <Box pt={4}>
            <NextLink href="/" passHref>
              <Button as="a" colorScheme="red" size="lg">
                Go to Homepage
              </Button>
            </NextLink>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
}
