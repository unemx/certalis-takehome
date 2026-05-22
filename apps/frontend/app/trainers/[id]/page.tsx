import type { Metadata } from "next";

import { TrainerDashboard } from "@/components/pages/TrainerDashboard/TrainerDashboard";

export const metadata: Metadata = {
  title: "Dashboard formateur",
};

type Props = {
  params: Promise<{ id: string }>;
};

const TrainerDashboardPage = async ({ params }: Props) => {
  const { id } = await params;
  return <TrainerDashboard trainerId={id} />;
};

export default TrainerDashboardPage;
