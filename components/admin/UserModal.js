import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  InputGroup,
  InputRightElement,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const UserModal = ({ isOpen, onClose, formMode, userForm, handleFormChange, handleSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{formMode === 'create' ? 'Add New User' : 'Edit User'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Stack spacing="4">
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="name"
                  value={userForm.name}
                  onChange={handleFormChange}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleFormChange}
                />
              </FormControl>
              
              <FormControl isRequired={formMode === 'create'}>
                <FormLabel>
                  {formMode === 'create' ? 'Password' : 'New Password (leave empty to keep current)'}
                </FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={userForm.password}
                    onChange={handleFormChange}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  name="role"
                  value={userForm.role}
                  onChange={handleFormChange}
                >
                  <option value="staff">Staff</option>
                  <option value="technician">Technician</option>
                  <option value="donor_coordinator">Donor Coordinator</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Administrator</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Department</FormLabel>
                <Input
                  name="department"
                  value={userForm.department}
                  onChange={handleFormChange}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Contact Number</FormLabel>
                <Input
                  name="contactNumber"
                  value={userForm.contactNumber}
                  onChange={handleFormChange}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isLoading}
            >
              {formMode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default UserModal;
