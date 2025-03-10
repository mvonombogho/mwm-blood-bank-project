import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Heading,
  Flex,
  Button,
  Spinner,
  Text,
  useToast,
  Badge,
  Grid,
  GridItem,
  Divider
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon } from '@chakra-ui/icons';
import DonationHistoryView from '@/components/donors/DonationHistoryView';
import EligibilityCheckView from '@/components/donors/EligibilityCheckView';

const DonorDetailsPage = () => {