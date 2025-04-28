import Header from "@/components/(user)/shared/widgets/header";
import { Toaster } from "react-hot-toast";
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Toaster />
      {children}
    </div>
  );
}
