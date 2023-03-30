import { Box, styled } from '@mui/material';
import { Footer, Navbar } from './components';
import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom';
import { StyledFlexColumn, StyledGrid } from 'styles';
import { QueryParamProvider } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";

function Layout() {
  const location = useLocation()

  const pathname = location.pathname;

  useEffect(() => {
   
  }, [pathname]);
    
  
  return (
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <StyledContainer>
        <Navbar />
        <StyledContent>
          <Outlet />
        </StyledContent>
        <Footer />
      </StyledContainer>
    </QueryParamProvider>
  );
}

const StyledContent = styled(StyledGrid)({
});

const StyledContainer = styled(StyledFlexColumn)({
  minHeight:'100vh',
  paddingTop: 100
});

export default Layout