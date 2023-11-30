import {
  useAppParams,
  useMobile,
} from "hooks/hooks";
import _ from "lodash";
import { DesktopMenu } from "./Desktop";
import { MobileMenu } from "./Mobile";


export function DaoMenu() {
  const mobile = useMobile();

  return mobile ? <MobileMenu /> : <DesktopMenu />;
}







