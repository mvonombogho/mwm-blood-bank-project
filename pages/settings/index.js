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