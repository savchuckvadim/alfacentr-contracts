import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogHeader,

    DialogDescription,
    DialogFooter,
} from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { FC } from 'react';


export const ModalMenu: FC<{
    title?: string;
    submitName?: string;
    cancelName?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit?: () => void;
}> = ({
    title,
    submitName,
    cancelName,
    description,
    children,
    footer,
    isOpen,
    onOpenChange,
    onSubmit,
}) => {
    return (
        <Dialog modal={true} open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[1000px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    {title && <DialogTitle>{title}</DialogTitle>}
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                {children}

                {footer && <DialogFooter>{footer}</DialogFooter>}

                <DialogFooter>
                    <Button variant="destructive"
                    className='bg-rose-600'
                    onClick={() => onOpenChange(false)}>
                        {cancelName ? cancelName : 'Отмена'}
                    </Button>
                    {onSubmit && (
                        <Button onClick={onSubmit}>
                            {submitName ? submitName : 'Отправить'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
