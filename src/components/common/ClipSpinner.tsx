import { ClipLoader } from "react-spinners";

export default function ClipSpinner({ color }: { color: string }) {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <ClipLoader color={color} />
    </div>
  );
}
