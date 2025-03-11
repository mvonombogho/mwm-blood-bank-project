import { useState, useEffect } from 'react';
import { 
  Box, Table, Thead, Tbody, Tr, Th, Td, Button, Badge, 
  HStack, Input, InputGroup, InputLeftElement, Select, 
  Spinner, useToast, IconButton, Menu, MenuButton, 
  MenuList, MenuItem, Flex, Text, useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import { 
  FaSearch, FaSort, FaFilter, FaEllipsisV, 
  FaEdit, FaTimes, FaEye, FaExchangeAlt
} from 'react-icons/fa';

const BloodUnitsList = ({ isLoading: externalLoading = false }) => {
  const [bloodUnits, setBloodUnits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const toast = useToast();
  
  const tableBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // This would be replaced with an actual API call
  useEffect(() => {
    // Update loading state if externally triggered
    if (externalLoading) {
      setIsLoading(true);
    }
    
    // Simulating API call delay
    const timer = setTimeout(() => {
      const mockData = [
        { 
          id: 'BU001', 
          unitId: 'BLD-2025-0001', 
          bloodType: 'A+', 
          donorId: 'D10045', 
          collectionDate: '2025-02-15', 
          expirationDate: '2025-04-15',
          status: 'Available',
          location: 'Main Storage - Unit 3'
        },
        { 
          id: 'BU002', 
          unitId: 'BLD-2025-0002', 
          bloodType: 'O-', 
          donorId: 'D10089', 
          collectionDate: '2025-02-20', 
          expirationDate: '2025-04-20',
          status: 'Reserved',
          location: 'Main Storage - Unit 1'
        },
        { 
          id: 'BU003', 
          unitId: 'BLD-2025-0003', 
          bloodType: 'B+', 
          donorId: 'D10124', 
          collectionDate: '2025-02-21', 
          expirationDate: '2025-03-14',
          status: 'Available',
          location: 'Main Storage - Unit 2'
        },
        { 
          id: 'BU004', 
          unitId: 'BLD-2025-0004', 
          bloodType: 'AB-', 
          donorId: 'D10076', 
          collectionDate: '2025-02-28', 
          expirationDate: '2025-04-28',
          status: 'Quarantined',
          location: 'Quarantine - Unit 1'
        },
        { 
          id: 'BU005', 
          unitId: 'BLD-2025-0005', 
          bloodType: 'A-', 
          donorId: 'D10098', 
          collectionDate: '2025-03-01', 
          expirationDate: '2025-05-01',
          status: 'Available',
          location: 'Main Storage - Unit 3'
        },
        { 
          id: 'BU006', 
          unitId: 'BLD-2025-0006', 
          bloodType: 'O+', 
          donorId: 'D10056', 
          collectionDate: '2025-03-05', 
          expirationDate: '2025-05-05',
          status: 'Available',
          location: 'Main Storage - Unit 1'
        },
        { 
          id: 'BU007', 
          unitId: 'BLD-2025-0007', 
          bloodType: 'B-', 
          donorId: 'D10034', 
          collectionDate: '2025-03-08', 
          expirationDate: '2025-05-08',
          status: 'Transfused',
          location: 'Records'
        },
      ];
      
      setBloodUnits(mockData);
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [externalLoading]);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'green';
      case 'Reserved': return 'blue';
      case 'Quarantined': return 'orange';
      case 'Transfused': return 'purple';
      case 'Discarded': return 'red';
      case 'Expired': return 'gray';
      default: return 'gray';
    }
  };
  
  const handleUpdateStatus = (unitId, newStatus) => {
    // This would be an API call in the real implementation
    setIsLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      setBloodUnits(prevUnits => 
        prevUnits.map(unit => 
          unit.unitId === unitId ? { ...unit, status: newStatus } : unit
        )
      );
      
      setIsLoading(false);
      
      toast({
        title: 'Status updated',
        description: `Blood unit ${unitId} status changed to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 500);
  };
  
  // Filter and search functionality
  const filteredUnits = bloodUnits.filter(unit => {
    const matchesSearch = unit.unitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.donorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesType = filterType ? unit.bloodType === filterType : true;
    const matchesStatus = filterStatus ? unit.status === filterStatus : true;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  return (
    <Box shadow="md" borderRadius="lg" overflow="hidden" bg={tableBg} mb={8}>
      <Box p={4}>
        <HStack spacing={4}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FaSearch color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search by Unit ID, Blood Type, Donor ID or Location" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          
          <Select 
            placeholder="All Blood Types" 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            maxW="180px"
          >
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </Select>
          
          <Select 
            placeholder="All Statuses" 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            maxW="180px"
          >
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Quarantined">Quarantined</option>
            <option value="Transfused">Transfused</option>
            <option value="Discarded">Discarded</option>
            <option value="Expired">Expired</option>
          </Select>
        </HStack>
      </Box>
      
      {isLoading ? (
        <Flex justify="center" align="center" p={8}>
          <Spinner size="xl" color="red.500" thickness="4px" />
        </Flex>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Unit ID</Th>
                <Th>Blood Type</Th>
                <Th>Donor ID</Th>
                <Th>Collection Date</Th>
                <Th>Expiration Date</Th>
                <Th>Status</Th>
                <Th>Location</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <Tr 
                    key={unit.id} 
                    _hover={{ bg: hoverBg }}
                  >
                    <Td fontWeight="medium">{unit.unitId}</Td>
                    <Td>
                      <Badge colorScheme="red" px={2} py={1} borderRadius="md">
                        {unit.bloodType}
                      </Badge>
                    </Td>
                    <Td>{unit.donorId}</Td>
                    <Td>{unit.collectionDate}</Td>
                    <Td>{unit.expirationDate}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(unit.status)} px={2} py={1} borderRadius="md">
                        {unit.status}
                      </Badge>
                    </Td>
                    <Td>{unit.location}</Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          aria-label="Options"
                          icon={<FaEllipsisV />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem icon={<FaEye />}>View Details</MenuItem>
                          <MenuItem icon={<FaEdit />}>Edit</MenuItem>
                          <MenuItem icon={<FaExchangeAlt />}>Change Status</MenuItem>
                          {/* Only show location transfer for non-transfused units */}
                          {unit.status !== 'Transfused' && unit.status !== 'Discarded' && (
                            <MenuItem icon={<FaExchangeAlt />}>Transfer Location</MenuItem>
                          )}
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={8} textAlign="center" py={6}>
                    <Text>No blood units found matching your criteria</Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default BloodUnitsList;
