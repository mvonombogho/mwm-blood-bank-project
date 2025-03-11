import { Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Text, Button, useColorModeValue } from '@chakra-ui/react';
import { FaUser, FaUserInjured, FaVial, FaUserShield } from 'react-icons/fa';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/auth/AuthGuard';
import NextLink from 'next/link';

const AdminDashboardPage = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // This would come from API in a real app
  const stats = {
    usersCount: 14,
    activeUsers: 12,
    admins: 2,
    pendingUsers: 1
  };
  
  const StatCard = ({ title, value, icon, color, link }) => {
    const Icon = icon;
    
    return (
      <Box p={5} shadow="md" borderWidth="1px" bg={cardBg} borderRadius="lg">
        <Flex justify="space-between" align="center">
          <Box>
            <StatLabel color="gray.500">{title}</StatLabel>
            <StatNumber fontSize="3xl" fontWeight="bold" color={`${color}.500`}>
              {value}
            </StatNumber>
          </Box>
          <Box p={3} borderRadius="full" bg={`${color}.50`}>
            <Icon size="24px" color={`${color}.500`} />
          </Box>
        </Flex>
        
        {link && (
          <NextLink href={link} passHref>
            <Button as="a" size="sm" variant="ghost" colorScheme={color} mt={3}>
              View Details
            </Button>
          </NextLink>
        )}
      </Box>
    );
  };
  
  return (
    <AuthGuard requiredPermissions={{ canManageUsers: true }}>
      <Layout title="Admin Dashboard">
        <Box maxW="7xl" mx="auto">
          <Heading as="h1" size="xl" mb={6}>
            Admin Dashboard
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <StatCard 
              title="Total Users"
              value={stats.usersCount}
              icon={FaUser}
              color="blue"
              link="/admin/users"
            />
            <StatCard 
              title="Active Users"
              value={stats.activeUsers}
              icon={FaUser}
              color="green"
              link="/admin/users?status=active"
            />
            <StatCard 
              title="Administrators"
              value={stats.admins}
              icon={FaUserShield}
              color="purple"
              link="/admin/users?role=admin"
            />
            <StatCard 
              title="Pending Accounts"
              value={stats.pendingUsers}
              icon={FaUser}
              color="orange"
              link="/admin/users?status=pending"
            />
          </SimpleGrid>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Box p={6} shadow="md" borderWidth="1px" bg={cardBg} borderRadius="lg">
              <Heading size="md" mb={4}>User Management</Heading>
              <Text mb={4}>
                Manage user accounts, roles, and permissions. Add new users or modify existing ones.
              </Text>
              <NextLink href="/admin/users" passHref>
                <Button as="a" colorScheme="blue">
                  Manage Users
                </Button>
              </NextLink>
            </Box>
            
            <Box p={6} shadow="md" borderWidth="1px" bg={cardBg} borderRadius="lg">
              <Heading size="md" mb={4}>System Settings</Heading>
              <Text mb={4}>
                Configure system settings, including security settings, email templates, and more.
              </Text>
              <NextLink href="/admin/settings" passHref>
                <Button as="a" colorScheme="purple">
                  System Settings
                </Button>
              </NextLink>
            </Box>
          </SimpleGrid>
        </Box>
      </Layout>
    </AuthGuard>
  );
};

export default AdminDashboardPage;
