import { Tooltip } from "@/modules/shared";
import { DocumentPreviewLine } from "../../../utils/document-rq.util";
import { FC } from "react";

export interface ClientRqViewLinesProps {
    lines: DocumentPreviewLine[];
    handleClientLineClick: (line: DocumentPreviewLine) => void;
}
export const ClientRqViewLines: FC<ClientRqViewLinesProps> = ({ lines, handleClientLineClick }) => {
    return (
        <>
            {lines.map((line, index) => (
                <ClientRqViewLine
                    key={`client-rq-line-item-${index}`}
                    line={line}
                    handleClientLineClick={handleClientLineClick}
                />
            ))}
        </>
    );
};


interface ClientRqViewLineProps {
    line: DocumentPreviewLine;
    handleClientLineClick: (line: DocumentPreviewLine) => void;
}
const ClientRqViewLine: FC<ClientRqViewLineProps> = ({ line, handleClientLineClick }) => {
    return (
        <Tooltip
            content={line.tooltip}
        >
            <p
                className={
                    line.canEdit
                        ? 'cursor-pointer hover:text-primary whitespace-pre-wrap'
                        : 'cursor-not-allowed text-muted-foreground whitespace-pre-wrap'
                }
                onClick={() => handleClientLineClick(line)}
            >
                {line.value}
            </p>
        </Tooltip>
    );
};
