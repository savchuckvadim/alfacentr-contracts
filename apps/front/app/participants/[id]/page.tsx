import { ParticipantPpkInfo } from "@/modules/widgetes"

export default async function Participants({ params }: { params: Promise<{ id: string }> }) {
  const param = await params
  const id = param.id
  return (
    <div className="container mx-auto px-4 py-6">
      <div>

        <ParticipantPpkInfo participantId={Number(id)} />
      </div>
    </div>
  );
} 