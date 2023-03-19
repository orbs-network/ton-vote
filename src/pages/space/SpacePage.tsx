import { Page } from "components";
import { Outlet } from "react-router-dom";

function SpacePage() {
  return (
    <Page>
      <Outlet />
    </Page>
  );
}



export { SpacePage };
