import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogTrigger, DialogDescription, DialogFooter } from "@workspace/ui/components/dialog"
import { Button } from "@workspace/ui/components/button"
import { FC } from "react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@workspace/ui/components/context-menu"


export const ModalMenu: FC<{
    children: React.ReactNode,
    footer?: React.ReactNode,
    isOpen?: boolean,
    onOpenChange?: (open: boolean) => void
}> = ({ children, footer, isOpen, onOpenChange }) => {
    
    
    return (
        <Dialog modal={true} open={isOpen} onOpenChange={onOpenChange}>
            <ContextMenu>
                <ContextMenuTrigger>Right click</ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem>Open</ContextMenuItem>
                    <ContextMenuItem>Download</ContextMenuItem>
                    <DialogTrigger asChild>
                        <ContextMenuItem>
                            <span>Delete</span>
                        </ContextMenuItem>
                    </DialogTrigger>
                    {children}
                </ContextMenuContent>
            </ContextMenu>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. Are you sure you want to permanently
                        delete this file from our servers?
                    </DialogDescription>
                </DialogHeader>
                {footer && <DialogFooter>
                    <Button type="submit">Confirm</Button>
                </DialogFooter>}
            </DialogContent>
        </Dialog>
    )
}
