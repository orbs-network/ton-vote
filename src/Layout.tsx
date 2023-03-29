import { Box, styled } from '@mui/material';
import { Footer, Navbar } from 'layouts';
import React from 'react'
import { Outlet } from 'react-router-dom';
import { StyledFlexColumn, StyledGrid } from 'styles';

function Layout() {
  return (
    <StyledContainer>
      <Navbar />
      <StyledContent>
        <Outlet />
      </StyledContent>
      <Footer />
    </StyledContainer>
  );
}

const StyledContent = styled(StyledGrid)({
  // marginBottom: 100
});

const StyledContainer = styled(StyledFlexColumn)({
  minHeight:'100vh',
  paddingTop: 100
});

export default Layout