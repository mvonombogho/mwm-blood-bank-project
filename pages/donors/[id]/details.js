import React from 'react';
import { useRouter } from 'next/router';
import DonorDetailPage from '../../../components/donors/DonorDetailPage';
import Layout from '../../../components/Layout';
import withAuth from '../../../components/auth/withAuth';

// This file replaces index.js to resolve the duplicate route warning
// It provides the same functionality but with a different route

const DonorDetails = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout title="Donor Details">
      <DonorDetailPage donorId={id} />
    </Layout>
  );
};

export default withAuth(DonorDetails);