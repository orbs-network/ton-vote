import { styled, Typography } from '@mui/material'
import { Button, Container } from 'components'
import { useAppNavigation } from 'router';
import { StyledFlexColumn } from 'styles';

 function BadRoute() {
    const navigate = useAppNavigation()
  return (
    <StyledContainer>
      <StyledFlexColumn gap={20}>
        <Typography className="title">Page doesn't exist</Typography>
        <Button onClick={() => navigate.daosPage.root()}>
          <Typography>Go Home</Typography>
        </Button>
      </StyledFlexColumn>
    </StyledContainer>
  );
}

export default BadRoute;

const StyledContainer = styled(Container)({
    margin:'auto',
    width:'100%',
    maxWidth: 500,
    ".title": {
        fontSize: 20,
        fontWeight: 600
    },
    button: {
        width: '70%',
    }
});