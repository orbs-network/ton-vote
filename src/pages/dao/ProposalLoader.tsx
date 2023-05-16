import { styled } from '@mui/material';
import { Container } from 'components';
import { StyledFlexColumn, StyledSkeletonLoader } from 'styles'

export function ProposalLoader() {
  return (
    <StyledContainer>
      <StyledFlexColumn alignItems="flex-start">
        <StyledSkeletonLoader width="30%" />
        <StyledSkeletonLoader width="90%" />
        <StyledSkeletonLoader width="50%" />

      </StyledFlexColumn>
    </StyledContainer>
  );
}

const StyledContainer = styled(Container)({
    width:'100%'
});

