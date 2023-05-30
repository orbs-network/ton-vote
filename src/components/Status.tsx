import { Chip } from "@mui/material";


export function Status({ status }: { status: string | undefined }) {
  if (!status) return null;
  return <Chip label={status} className="status" color="primary" />;
}
