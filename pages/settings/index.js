import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Button,
  Icon,
  Flex,
  Stack,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  useToast,
  HStack,
  VStack,
  Badge,
  Avatar,
  InputGroup,
  InputRightElement,
  Spinner,
  Center
} from '@chakra-ui/react';
import { 
  FiSave, 
  FiUser, 
  FiLock, 
  FiMail, 
  FiSettings, 
  FiBell, 
  FiEye, 
  FiEyeOff,
  FiGlobe,
  FiShield,
  FiDatabase,
  FiServer
} from 'react-icons/fi';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const SettingsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === 'loading';

  // State for user profile settings
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    department: ''
  });
  
  // State for notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    lowInventoryAlerts: true,
    expiryAlerts: true,
    donationReminders: false,
    systemUpdates: true
  });
  
  // State for security settings
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordLastChanged: '2023-05-01'
  });
  
  // State for system settings
  const [systemSettings, setSystemSettings] = useState({
    bloodExpiryDays: '42',
    criticalInventoryLevel: '10',
    lowInventoryLevel: '20',
    defaultLanguage: 'en',
    dateFormat: 'MM/DD/YYYY'
  });
  
  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');

  // Fetch current user data when session is loaded
  useEffect(() => {
    if (session) {
      // Fetch user profile using the profile endpoint
      fetchUserProfile();
    } else if (status === 'unauthenticated') {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    }
  }, [session, status]);

  // Function to fetch user profile data
  const fetchUserProfile = async () => {
    try {
      // First set basic data from session
      if (session && session.user) {
        setUserProfile({
          ...userProfile,
          name: session.user.name || '',
          email: session.user.email || '',
          role: session.user.role || ''
        });
      }

      // Fetch more detailed user data from the profile API
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const userData = await response.json();
        setUserProfile({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || '',
          phone: userData.contactNumber || '',
          department: userData.department || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Toggle password visibility
  const handleTogglePassword = () => setShowPassword(!showPassword);
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userProfile.name,
          email: userProfile.email,
          contactNumber: userProfile.phone,
          department: userProfile.department
        })
      });
      
      if (response.ok) {
        toast({
          title: 'Profile Updated',
          description: 'Your profile settings have been saved successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile settings',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'New password and confirmation do not match.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      
      if (response.ok) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been changed successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle notification settings update
  const handleNotificationUpdate = () => {
    // API call to update notification settings would go here
    
    toast({
      title: 'Notification Settings Updated',
      description: 'Your notification preferences have been saved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle security settings update
  const handleSecurityUpdate = () => {
    // API call to update security settings would go here
    
    toast({
      title: 'Security Settings Updated',
      description: 'Your security settings have been saved.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Handle system settings update
  const handleSystemUpdate = () => {
    // API call to update system settings would go here
    
    toast({
      title: 'System Settings Updated',
      description: 'Blood bank system settings have been updated.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <Center h="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="red.500" />
          <Text>Loading your settings...</Text>
        </VStack>
      </Center>
    );
  }
  
  return (
    <Box p={5}>
      <Heading as="h1" size="xl" mb={6}>Settings</Heading>
      
      <Tabs colorScheme="red" variant="enclosed">
        <TabList mb={4}>
          <Tab><Icon as={FiUser} mr={2} />Profile</Tab>
          <Tab><Icon as={FiBell} mr={2} />Notifications</Tab>
          <Tab><Icon as={FiShield} mr={2} />Security</Tab>
          <Tab><Icon as={FiSettings} mr={2} />System</Tab>
        </TabList>
        
        <TabPanels>
          {/* Profile Settings Panel */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Card bg={bgColor} boxShadow="md">
                <CardHeader>
                  <Heading size="md">Personal Information</Heading>
                </CardHeader>
                <Divider />
                <CardBody>
                  <form onSubmit={handleProfileUpdate}>
                    <VStack spacing={4} align="start">
                      <Flex 
                        width="100%" 
                        direction={{ base: "column", md: "row" }} 
                        align="center" 
                        justify="center"
                        mb={4}
                      >
                        <Avatar 
                          size="xl" 
                          name={userProfile.name} 
                          src="/avatars/default-avatar.jpg" 
                          mb={{ base: 4, md: 0 }}
                          mr={{ md: 6 }}
                        />
                        <Box>
                          <Heading size="md">{userProfile.name}</Heading>
                          <HStack mt={1}>
                            <Badge colorScheme="red">{userProfile.role}</Badge>
                            <Text fontSize="sm" color="gray.500">{userProfile.department}</Text>
                          </HStack>
                          <Button size="sm" colorScheme="blue" mt={2}>
                            Change Avatar
                          </Button>
                        </Box>
                      </Flex>
                      
                      <FormControl>
                        <FormLabel>Full Name</FormLabel>
                        <Input 
                          value={userProfile.name}
                          onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Email Address</FormLabel>
                        <Input 
                          type="email"
                          value={userProfile.email}
                          onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Phone Number</FormLabel>
                        <Input 
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Department</FormLabel>
                        <Input 
                          value={userProfile.department}
                          onChange={(e) => setUserProfile({...userProfile, department: e.target.value})}
                        />
                      </FormControl>
                      
                      <Button 
                        type="submit" 
                        colorScheme="blue" 
                        leftIcon={<FiSave />}
                        mt={2}
                      >
                        Save Profile
                      </Button>
                    </VStack>
                  </form>
                </CardBody>
              </Card>
              
              <Card bg={bgColor} boxShadow="md">
                <CardHeader>
                  <Heading size="md">Change Password</Heading>
                </CardHeader>
                <Divider />
                <CardBody>
                  <form onSubmit={handlePasswordChange}>
                    <VStack spacing={4}>
                      <FormControl>
                        <FormLabel>Current Password</FormLabel>
                        <InputGroup>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                          <InputRightElement>
                            <Button variant="ghost" onClick={handleTogglePassword} size="sm">
                              <Icon as={showPassword ? FiEyeOff : FiEye} />
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>New Password</FormLabel>
                        <InputGroup>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <InputRightElement>
                            <Button variant="ghost" onClick={handleTogglePassword} size="sm">
                              <Icon as={showPassword ? FiEyeOff : FiEye} />
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Confirm New Password</FormLabel>
                        <InputGroup>
                          <Input 
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <InputRightElement>
                            <Button variant="ghost" onClick={handleTogglePassword} size="sm">
                              <Icon as={showPassword ? FiEyeOff : FiEye} />
                            </Button>
                          </InputRightElement>
                        </InputGroup>
                      </FormControl>
                      
                      <Text fontSize="sm" color="gray.500">
                        Password last changed: {security.passwordLastChanged}
                      </Text>
                      
                      <Button 
                        type="submit" 
                        colorScheme="blue" 
                        leftIcon={<FiLock />}
                        width="100%"
                      >
                        Update Password
                      </Button>
                    </VStack>
                  </form>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Notifications Settings Panel */}
          <TabPanel>
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Notification Preferences</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack spacing={4} align="start">
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="email-alerts" 
                      colorScheme="red" 
                      mr={3}
                      isChecked={notifications.emailAlerts}
                      onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                    />
                    <FormLabel htmlFor="email-alerts" mb="0">
                      Email Notifications
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="inventory-alerts" 
                      colorScheme="red" 
                      mr={3}
                      isChecked={notifications.lowInventoryAlerts}
                      onChange={(e) => setNotifications({...notifications, lowInventoryAlerts: e.target.checked})}
                    />
                    <FormLabel htmlFor="inventory-alerts" mb="0">
                      Low Blood Inventory Alerts
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="expiry-alerts" 
                      colorScheme="red" 
                      mr={3}
                      isChecked={notifications.expiryAlerts}
                      onChange={(e) => setNotifications({...notifications, expiryAlerts: e.target.checked})}
                    />
                    <FormLabel htmlFor="expiry-alerts" mb="0">
                      Blood Expiry Notifications
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="donation-reminders" 
                      colorScheme="red" 
                      mr={3}
                      isChecked={notifications.donationReminders}
                      onChange={(e) => setNotifications({...notifications, donationReminders: e.target.checked})}
                    />
                    <FormLabel htmlFor="donation-reminders" mb="0">
                      Donation Campaign Reminders
                    </FormLabel>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="system-updates" 
                      colorScheme="red" 
                      mr={3}
                      isChecked={notifications.systemUpdates}
                      onChange={(e) => setNotifications({...notifications, systemUpdates: e.target.checked})}
                    />
                    <FormLabel htmlFor="system-updates" mb="0">
                      System Updates and Maintenance Alerts
                    </FormLabel>
                  </FormControl>
                  
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<FiSave />} 
                    mt={4}
                    onClick={handleNotificationUpdate}
                  >
                    Save Notification Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Security Settings Panel */}
          <TabPanel>
            <Card bg={bgColor} boxShadow="md">
              <CardHeader>
                <Heading size="md">Security Settings</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack spacing={6} align="start">
                  <FormControl display="flex" alignItems="center">
                    <Switch 
                      id="two-factor" 
                      colorScheme="red" 
                      mr={3}
                      isChecked={security.twoFactorAuth}
                      onChange={(e) => setSecurity({...security, twoFactorAuth: e.target.checked})}
                    />
                    <Box>
                      <FormLabel htmlFor="two-factor" mb="0">
                        Two-Factor Authentication
                      </FormLabel>
                      <Text fontSize="sm" color="gray.500">
                        Add an extra layer of security to your account
                      </Text>
                    </Box>
                  </FormControl>
                  
                  <Divider />
                  
                  <FormControl>
                    <FormLabel>Session Timeout (minutes)</FormLabel>
                    <Select 
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </Select>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Automatically log out after period of inactivity
                    </Text>
                  </FormControl>
                  
                  <Divider />
                  
                  <Box>
                    <Heading size="sm" mb={2}>Login History</Heading>
                    <Text fontSize="sm">
                      Last login: March 12, 2025, 08:45 AM
                    </Text>
                    <Text fontSize="sm">
                      IP Address: 192.168.1.25
                    </Text>
                    <Button size="sm" colorScheme="blue" variant="outline" mt={2}>
                      View Full Login History
                    </Button>
                  </Box>
                  
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<FiSave />} 
                    mt={2}
                    onClick={handleSecurityUpdate}
                  >
                    Save Security Settings
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* System Settings Panel */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Card bg={bgColor} boxShadow="md">
                <CardHeader>
                  <Heading size="md"><Icon as={FiDatabase} mr={2} />Blood Bank Settings</Heading>
                </CardHeader>
                <Divider />
                <CardBody>
                  <VStack spacing={4} align="start">
                    <FormControl>
                      <FormLabel>Blood Expiry Period (days)</FormLabel>
                      <Input 
                        type="number"
                        value={systemSettings.bloodExpiryDays}
                        onChange={(e) => setSystemSettings({...systemSettings, bloodExpiryDays: e.target.value})}
                      />
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Standard period before blood units expire
                      </Text>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Critical Inventory Level (%)</FormLabel>
                      <Input 
                        type="number"
                        value={systemSettings.criticalInventoryLevel}
                        onChange={(e) => setSystemSettings({...systemSettings, criticalInventoryLevel: e.target.value})}
                      />
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Threshold for critical inventory alerts
                      </Text>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Low Inventory Level (%)</FormLabel>
                      <Input 
                        type="number"
                        value={systemSettings.lowInventoryLevel}
                        onChange={(e) => setSystemSettings({...systemSettings, lowInventoryLevel: e.target.value})}
                      />
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Threshold for low inventory alerts
                      </Text>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
              
              <Card bg={bgColor} boxShadow="md">
                <CardHeader>
                  <Heading size="md"><Icon as={FiGlobe} mr={2} />Regional Settings</Heading>
                </CardHeader>
                <Divider />
                <CardBody>
                  <VStack spacing={4} align="start">
                    <FormControl>
                      <FormLabel>Default Language</FormLabel>
                      <Select 
                        value={systemSettings.defaultLanguage}
                        onChange={(e) => setSystemSettings({...systemSettings, defaultLanguage: e.target.value})}
                      >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                        <option value="sw">Swahili</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Date Format</FormLabel>
                      <Select 
                        value={systemSettings.dateFormat}
                        onChange={(e) => setSystemSettings({...systemSettings, dateFormat: e.target.value})}
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Time Zone</FormLabel>
                      <Select defaultValue="Africa/Nairobi">
                        <option value="Africa/Nairobi">East Africa Time (EAT)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
            
            <Card bg={bgColor} boxShadow="md" mt={8}>
              <CardHeader>
                <Heading size="md"><Icon as={FiServer} mr={2} />System Maintenance</Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Heading size="sm" mb={2}>Database Backup</Heading>
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      Last backup: March 11, 2025, 02:00 AM
                    </Text>
                    <HStack>
                      <Button colorScheme="blue" size="sm">
                        Backup Now
                      </Button>
                      <Button colorScheme="gray" size="sm">
                        Schedule Backup
                      </Button>
                    </HStack>
                  </Box>
                  
                  <Box>
                    <Heading size="sm" mb={2}>System Information</Heading>
                    <Text fontSize="sm">Version: 1.0.0</Text>
                    <Text fontSize="sm">Database: MongoDB</Text>
                    <Text fontSize="sm">Last updated: March 10, 2025</Text>
                    <Button colorScheme="blue" size="sm" mt={2} variant="outline">
                      Check for Updates
                    </Button>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
            
            <Flex justify="flex-end" mt={6}>
              <Button 
                colorScheme="blue" 
                leftIcon={<FiSave />}
                onClick={handleSystemUpdate}
              >
                Save System Settings
              </Button>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default SettingsPage;