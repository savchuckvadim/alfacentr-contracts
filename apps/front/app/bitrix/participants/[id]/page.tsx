import { ParticipantPage } from '@/modules/pages';

export default async function Participants({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const param = await params;
    const id = param.id;
    return (
        <div className="container mx-auto px-4 py-6">
            <div>
                <ParticipantPage id={Number(id)} />
            </div>
        </div>
    );
}
