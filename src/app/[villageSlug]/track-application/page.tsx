import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ villageSlug: string }>;
}

export default async function TrackPage({ params }: Props) {
  const { villageSlug } = await params;
  redirect(`/${villageSlug}/services`);
}