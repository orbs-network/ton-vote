import { Container } from 'components';
import { StyledFlexColumn, StyledSkeletonLoader } from 'styles'

export function ProposalLoader() {
  return (
    <Container>
      <StyledFlexColumn alignItems="flex-start">
        <StyledSkeletonLoader width="30%" />
        <StyledSkeletonLoader width="90%" />
        <StyledSkeletonLoader width="50%" />

      </StyledFlexColumn>
    </Container>
  );
}



