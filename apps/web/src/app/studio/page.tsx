import { getTracks } from "@/lib/crate";
import { SetBuilder } from "../components/SetBuilder";

export const metadata = {
  title: "The Studio · Set Builder",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <SetBuilder tracks={getTracks()} />;
}
