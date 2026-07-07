'use client';

import { ModalMenu } from '@/modules/shared';
import { Label } from '@workspace/ui/components/label';
import useCommunications from '../../hook/useCommunications';

export const ContactSyncConfirmMenu = () => {
    const { contactSync, email, saveContact, cancelContactSync } =
        useCommunications();

    return (
        <ModalMenu
            isOpen={contactSync.isConfirmActive}
            onOpenChange={cancelContactSync}
            onSubmit={saveContact}
            submitName="Сохранить"
            title="Email изменился"
            description="Сохранить контакт в сделке?"
            submitDisabled={contactSync.isSaving}
            withoutCancel={contactSync.isSaving}
        >
            <div className="flex flex-row gap-2 items-center">
                <Label>Email:</Label>
                <Label className="text-foreground/70">
                    {(email?.value as string) || '—'}
                </Label>
            </div>
        </ModalMenu>
    );
};
