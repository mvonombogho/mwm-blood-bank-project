import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Icon,
  Text,
  Drawer,
  DrawerContent,
  IconButton,
  useDisclosure,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Heading,
  Button,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiX,
  FiUsers,
  FiDroplet,
  FiUser,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiHome,
  FiArchive,
} from 'react-icons/fi';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

const SidebarContent = ({ onClose, ...rest }) => {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Define navigation items based on user permissions
  const navItems = [];
  
  // Only add items the user has permission to access
  navItems.push({ name: 'Dashboard', icon: FiHome, href: '/' });
  
  if (session?.user?.permissions?.canManageDonors) {
    navItems.push({ name: 'Donors', icon: FiUsers, href: '/donors' });
  }
  
  if (session?.user?.permissions?.canManageInventory) {
    navItems.push({ name: 'Inventory', icon: FiDroplet, href: '/inventory' });
  }
  
  if (session?.user?.permissions?.canManageRecipients) {
    navItems.push({ name: 'Recipients', icon: FiUsers, href: '/recipients' });
  }
  
  if (session?.user?.permissions?.canGenerateReports) {
    navItems.push({ name: 'Reports', icon: FiBarChart2, href: '/reports' });
  }
  
  if (session?.user?.permissions?.canManageUsers) {
    navItems.push({ name: 'Users', icon: FiUser, href: '/admin/users' });
    navItems.push({ name: 'Settings', icon: FiSettings, href: '/settings' });
  }
  
  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Flex alignItems="center">
          <Icon as={FiDroplet} h={8} w={8} color="red.500" mr={2} />
          <Heading size="md">Blood Bank</Heading>
        </Flex>
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onClose}
          variant="ghost"
          aria-label="close menu"
          icon={<FiX />}
        />
      </Flex>
      
      <VStack spacing={1} align="stretch" mt={4}>
        {navItems.map((navItem) => (
          <Box
            as={NextLink}
            href={navItem.href}
            key={navItem.name}
            role="group"
          >
            <Flex
              align="center"
              p="4"
              mx="4"
              borderRadius="lg"
              cursor="pointer"
              color={router.pathname === navItem.href ? 'blue.500' : 'gray.600'}
              bg={router.pathname === navItem.href ? 'blue.50' : 'transparent'}
              fontWeight={router.pathname === navItem.href ? 'bold' : 'normal'}
              _hover={{
                bg: 'blue.50',
                color: 'blue.500',
              }}
            >
              <Icon
                mr="4"
                fontSize="16"
                as={navItem.icon}
              />
              {navItem.name}
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

const MainLayout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Force login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }
  
  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Text>Loading...</Text>
      </Flex>
    );
  }
  
  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' });
  };
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <SidebarContent
        onClose={onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      
      {/* Header */}
      <Flex
        ml={{ base: 0, md: 60 }}
        px={{ base: 4, md: 8 }}
        height="20"
        alignItems="center"
        bg={useColorModeValue('white', 'gray.900')}
        borderBottomWidth="1px"
        borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
        justifyContent="space-between"
      >
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
          icon={<FiMenu />}
        />
        
        <HStack spacing={{ base: '0', md: '6' }}>
          <Flex alignItems={'center'}>
            <Menu>
              <MenuButton
                py={2}
                transition="all 0.3s"
                _focus={{ boxShadow: 'none' }}
              >
                <HStack>
                  <Avatar
                    size={'sm'}
                    name={session?.user?.name}
                  />
                  <VStack
                    display={{ base: 'none', md: 'flex' }}
                    alignItems="flex-start"
                    spacing="1px"
                    ml="2"
                  >
                    <Text fontSize="sm">{session?.user?.name}</Text>
                    <Text fontSize="xs" color="gray.600">
                      {session?.user?.role?.charAt(0).toUpperCase() + session?.user?.role?.slice(1).replace('_', ' ')}
                    </Text>
                  </VStack>
                  <Box display={{ base: 'none', md: 'flex' }}>
                    <FiChevronDown />
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList
                bg={useColorModeValue('white', 'gray.900')}
                borderColor={useColorModeValue('gray.200', 'gray.700')}
              >
                <MenuItem as={NextLink} href="/profile">
                  Profile
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout} icon={<FiLogOut />}>
                  Sign out
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </HStack>
      </Flex>
      
      {/* Main content */}
      <Box ml={{ base: 0, md: 60 }} p={4}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
