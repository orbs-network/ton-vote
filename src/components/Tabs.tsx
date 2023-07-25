import * as React from "react";
import MuiTabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { StyledFlexColumn } from "styles";
import { styled } from "@mui/material";

interface CustomTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: CustomTabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      className="panel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <div className="panel-children" style={{ paddingTop:10 }}>
          {children}
        </div>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface TabProps {
  label: string;
  children: React.ReactNode;
}

interface Props {
  tabs: TabProps[];
}

export const Tabs = ({ tabs = []}: Props) => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <StyledTabs
        sx={{ borderBottom: 1, borderColor: "divider", width: "100%" }}
      >
        <MuiTabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
        >
          {tabs.map((it, index) => {
            return <Tab key={index} label={it.label} {...a11yProps(index)} />;
          })}
        </MuiTabs>
      </StyledTabs>
      {tabs.map((it, index) => {
        return (
          <CustomTabPanel key={index} value={value} index={index}>
            {it.children}
          </CustomTabPanel>
        );
      })}
    </>
  );
};


const StyledTabs = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 1,
  backgroundColor: theme.palette.background.paper,
  width: "100%",
}));
