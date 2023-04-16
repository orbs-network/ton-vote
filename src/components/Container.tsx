import { Box, styled } from "@mui/material";
import React, { ReactNode } from "react";
import {
  StyledContainer,
  StyledTitle,
  StyledFlexColumn,
  StyledFlexRow,
  StyledSkeletonLoader,
} from "styles";

const Container = React.forwardRef(
  (
    {
      children,
      className = "",
      title,
      loading,
      loaderAmount,
      headerChildren,
      onClick,
    }: {
      children?: ReactNode;
      className?: string;
      title?: string;
      loading?: boolean;
      loaderAmount?: number;
      headerChildren?: ReactNode;
      onClick?: () => void;
    },
    ref: any
  ) => {
    const showHeader = title || headerChildren;

    return (
      <StyledContainer style={{width:'100%'}} onClick={onClick} className={className} ref={ref}>
        {showHeader && (
          <StyledHeader style={{
            marginBottom: children ? 20 : 0
          }} className="container-header">
            {loading ? (
              <StyledHeaderLoader />
            ) : (
              <>
                {title ?  <Title>{title}</Title> : <span></span>}
                {headerChildren}
              </>
            )}
          </StyledHeader>
        )}

        {!children ? null : loading ? (
          <Loader loaderAmount={loaderAmount} />
        ) : (
          <div className="container-children">{children}</div>
        )}
      </StyledContainer>
    );
  }
);


const Loader = ({ loaderAmount = 4 }: { loaderAmount?: number }) => {
  return (
    <StyledLoaderContainer>
      {[...Array(loaderAmount).keys()].map((i) => {
        const percent = (i + 1) * 20;
        return (
          <StyledLoader
            key={i}
            style={{ width: percent > 100 ? `100%` : `${percent}%` }}
          />
        );
      })}
    </StyledLoaderContainer>
  );
};

const StyledLoader = styled(StyledSkeletonLoader)({
  height: 20,
  transform: "unset",
  borderRadius: 10,
  gap: 15,
});
const StyledHeaderLoader = styled(StyledLoader)({
  width:'30%',
  marginRight:'auto'
});

const StyledLoaderContainer = styled(StyledFlexColumn)({
  gap: 10,
  alignItems: "flex-start",
});



const StyledHeader = styled(StyledFlexRow)({
  alignItems: "flex-start",
  justifyContent:'space-between'
});

const Title = ({ children }: { children: string }) => {
  return <StyledTitle variant="h4">{children}</StyledTitle>;
};




export { Container };
