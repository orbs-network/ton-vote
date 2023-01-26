import { LinearProgress, styled } from '@mui/material'


export function Progress({ progress }: { progress: number }) {
  return <StyledContainer variant="determinate" value={progress} />;
}


const StyledContainer = styled(LinearProgress)({
    height: 10,
    borderRadius:10,
    width:'100%'
});