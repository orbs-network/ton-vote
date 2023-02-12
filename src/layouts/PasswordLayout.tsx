import { styled, Typography } from "@mui/material";
import { Button, Container, Input, useNotification } from "components";
import { PASSWORD } from "config";
import React, { useEffect, useState } from "react";

const AUTHORIZATION_LOCAL_STORAGE = "ton_vote_authorized";

function PasswordLayout({ onAuthorized }: { onAuthorized: () => void }) {
  const { showNotification } = useNotification();
  const [password, setPassword] = useState("");

  useEffect(() => {
    const isAuthorized = localStorage.getItem(AUTHORIZATION_LOCAL_STORAGE);
    if (isAuthorized) {
      onAuthorized();
    }
  }, []);

  const submit = () => {
    if (password !== PASSWORD) {
      showNotification({ variant: "error", message: "Invalid password" });
      return 
    }
    onAuthorized();
    localStorage.setItem(AUTHORIZATION_LOCAL_STORAGE, "1");
  };
  return (
    <StyledLayout title=" Hello, please enter password">
      <Input type='password' value={password} onChange={setPassword} label="Password" />
      <StyledSubmit disabled={!password} onClick={submit}>
        Submit
      </StyledSubmit>
    </StyledLayout>
  );
}

export default PasswordLayout;

const StyledSubmit = styled(Button)({
    marginTop:30,
    minWidth: 200
});

const StyledLayout = styled(Container)({
  maxWidth: 500,
  width: "calc(100% - 100px)",
   marginTop:50,
  marginLeft: "auto",
  marginRight: "auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap:5,
  h4: {
    textAlign: "center",
  },
});

