'use client'
import { ParticipantsPage } from '@/modules/entities/participant/ui';
import { useApp } from '@/modules/app/lib/hooks/app';

export default function Participants() {
  const { isClient } = useApp();
  if (!isClient) return null;

  return (
    <div className="container mx-auto px-4 py-6">
      <ParticipantsPage />
    </div>
  );
} 