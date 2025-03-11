import { useState, useEffect } from 'react';
import { Box, Flex, Stack, Link, Icon, Text, Heading, IconButton, useDisclosure, useColorModeValue, VStack, HStack, CloseButton, Drawer, DrawerOverlay, DrawerContent, DrawerBody, Menu, MenuButton, MenuList, MenuItem, Avatar, Divider, Button } from '@chakra-ui/react';
import { FaHome, FaUser, FaUserInjured, FaVial, FaThermometerHalf, FaSignOutAlt, FaChartLine, FaBars, FaCog, FaChevronDown } from 'react-icons/fa';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession, signOut } from 'next-auth/react';

const Layout = ({ children, title = 'Blood Bank Management System' }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  
  // Get current page path to determine active links
  const currentPath = router.pathname;
  
  const backgroundColor = useColorModeValue('gray.50', 'gray.900');
  const foregroundColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const primaryColor = 'red.500';
  const primaryHoverColor = 'red.600';
  
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };
  
  // Define sidebar items based on user permissions
  const getSidebarItems = () => {
    const items = [
      { name: 'Dashboard', icon: FaHome, path: '/' }
    ];
    
    // Add items based on permissions if user is logged in
    if (isAuthenticated) {
      if (session.user.permissions.canManageDonors) {
        items.push({ name: 'Donors', icon: FaUser, path: '/donors' });
      }
      
      if (session.user.permissions.canManageRecipients) {
        items.push({ name: 'Recipients', icon: FaUserInjured, path: '/recipients' });
      }
      
      if (session.user.permissions.canManageInventory) {
        items.push({ 
          name: 'Inventory', 
          icon: FaVial, 
          path: '/inventory', 
          subItems: [
            { name: 'Blood Units', path: '/inventory/blood-units' },
            { name: 'Storage', path: '/inventory/storage' },
            { name: 'Expiry Tracking', path: '/inventory/expiry-tracking' },
            { name: 'Reports', path: '/inventory/reports' },
          ] 
        });
      }
      
      if (session.user.permissions.canGenerateReports) {
        items.push({ name: 'Reports', icon: FaChartLine, path: '/reports' });
      }
      
      if (session.user.permissions.canManageUsers) {
        items.push({ name: 'Users', icon: FaUser, path: '/admin/users' });
      }
    }
    
    return items;
  };
  
  const sidebarItems = getSidebarItems();
  
  const NavItem = ({ item, isActive = false }) => {
    const [isExpanded, setIsExpanded] = useState(
      currentPath.startsWith(item.path) && item.subItems
    );
    
    const activeColor = isActive ? primaryColor : 'inherit';
    const activeStyles = isActive ? { color: activeColor, fontWeight: 'bold' } : {};
    
    const clickSubMenu = (e) => {
      if (item.subItems) {
        e.preventDefault();
        setIsExpanded(!isExpanded);
      }
    };
    
    return (
      <Box mb={item.subItems ? 0 : 1}>
        <NextLink href={item.path} passHref>
          <Link 
            display="flex"
            alignItems="center"
            p={3}
            borderRadius="md"
            _hover={{ bg: isActive ? `${primaryColor}10` : 'gray.100', textDecoration: 'none' }}
            onClick={clickSubMenu}
            {...activeStyles}
          >
            <Icon as={item.icon} mr={3} boxSize={5} />
            <Text fontSize="md">{item.name}</Text>
          </Link>
        </NextLink>
        
        {item.subItems && isExpanded && (
          <VStack mt={1} ml={6} spacing={1} align="stretch">
            {item.subItems.map((subItem, index) => {
              const isSubActive = currentPath === subItem.path;
              const subActiveStyles = isSubActive ? { color: primaryColor, fontWeight: 'bold' } : {};
              
              return (
                <NextLink key={index} href={subItem.path} passHref>
                  <Link 
                    p={2}
                    pl={3}
                    borderRadius="md"
                    fontSize="sm"
                    _hover={{ bg: 'gray.100', textDecoration: 'none' }}
                    {...subActiveStyles}
                  >
                    {subItem.name}
                  </Link>
                </NextLink>
              );
            })}
          </VStack>
        )}
      </Box>
    );
  };
  
  const Sidebar = ({ isDrawer = false }) => (
    <Stack spacing={1} h="100%" display="flex" flexDirection="column">
      <Box py={5} px={3}>
        <Heading as="h1" size="md" color={primaryColor}>
          Blood Bank Management
        </Heading>
        <Text fontSize="sm" color="gray.500" mt={1}>
          Mercy Wamaitha Mathu
        </Text>
      </Box>
      
      {isDrawer && (
        <Box px={4} pb={4}>
          <CloseButton onClick={onClose} />
        </Box>
      )}
      
      <VStack align="stretch" spacing={0} flex="1">
        {sidebarItems.map((item, index) => (
          <NavItem 
            key={index} 
            item={item} 
            isActive={item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path)}
          />
        ))}
      </VStack>
      
      {isAuthenticated ? (
        <Box mt="auto" pt={6} p={3}>
          <Divider mb={3} />
          <Flex align="center" mb={3}>
            <Avatar 
              size="sm" 
              name={session.user.name} 
              mr={2} 
              bg="red.500" 
            />
            <Box>
              <Text fontWeight="medium" fontSize="sm">{session.user.name}</Text>
              <Text fontSize="xs" color="gray.500">{session.user.role}</Text>
            </Box>
          </Flex>
          
          <Button 
            w="full"
            variant="outline"
            leftIcon={<FaSignOutAlt />}
            onClick={handleLogout}
            colorScheme="red"
            size="sm"
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Box mt="auto" pt={6}>
          <NextLink href="/auth/login" passHref>
            <Button 
              as="a" 
              w="full" 
              colorScheme="red" 
              mx={3} 
              mb={3}
            >
              Login
            </Button>
          </NextLink>
        </Box>
      )}
    </Stack>
  );
  
  // If the route is an auth route, don't show the sidebar
  if (currentPath.startsWith('/auth/')) {
    return children;
  }
  
  return (
    <Box>
      <Head>
        <title>{title} | Blood Bank Management System</title>
        <meta name="description" content="Blood Bank Management System" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Flex minH="100vh">
        {/* Desktop Sidebar */}
        <Box 
          display={{ base: 'none', md: 'block' }}
          w="260px"
          bg={foregroundColor}
          borderRight="1px"
          borderColor={borderColor}
          position="fixed"
          h="100vh"
          overflowY="auto"
          px={3}
        >
          <Sidebar />
        </Box>
        
        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerBody p={0}>
              <Sidebar isDrawer={true} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        
        {/* Main Content */}
        <Box 
          flex="1"
          ml={{ base: 0, md: '260px' }}
          bg={backgroundColor}
          minH="100vh"
        >
          {/* Mobile Header */}
          <Flex 
            display={{ base: 'flex', md: 'none' }}
            align="center"
            justify="space-between"
            px={4}
            py={4}
            bg={foregroundColor}
            borderBottomWidth="1px"
            borderColor={borderColor}
          >
            <Heading as="h1" size="md" color={primaryColor}>
              Blood Bank Management
            </Heading>
            
            <HStack spacing={3}>
              {isAuthenticated && (
                <Menu placement="bottom-end">
                  <MenuButton
                    as={IconButton}
                    size="sm"
                    variant="ghost"
                    aria-label="User menu"
                    icon={<Avatar size="xs" name={session?.user?.name} bg="red.500" />}
                  />
                  <MenuList>
                    <MenuItem fontSize="sm" fontWeight="medium">
                      {session?.user?.name}
                    </MenuItem>
                    <MenuItem fontSize="xs" opacity={0.7}>
                      {session?.user?.email}
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<FaCog />}>Account Settings</MenuItem>
                    <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>Logout</MenuItem>
                  </MenuList>
                </Menu>
              )}
              
              <IconButton 
                icon={<FaBars />} 
                aria-label="Open Menu" 
                onClick={onOpen}
                variant="ghost"
                colorScheme="red"
              />
            </HStack>
          </Flex>
          
          {/* Page Content */}
          <Box p={{ base: 4, md: 8 }}>
            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;
