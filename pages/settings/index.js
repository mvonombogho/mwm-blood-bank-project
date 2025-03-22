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