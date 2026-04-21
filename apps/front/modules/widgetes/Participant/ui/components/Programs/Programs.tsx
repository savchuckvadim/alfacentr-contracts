import { Badge } from '@workspace/ui/components/badge';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { BookOpen, Trash2 } from 'lucide-react';

export const Programs = ({
    programs,
    id,
    handleRemoveProgram,
    expandedSections,
    toggleSection,
    isPpk,
}: {
    programs: { type?: string; value: string }[];
    isPpk: boolean;
    id: number;
    handleRemoveProgram: (index: number) => void;
    expandedSections: { programs: boolean };
    toggleSection: (
        section: 'programs' | 'products' | 'missing' | 'participantInfo',
    ) => void;
}) => {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-lg">
                            {isPpk
                                ? 'ППК программы из заявки'
                                : 'Семинар: дни участия из заявки'}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                            {programs?.length || 0}
                        </Badge>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection('programs')}
                    >
                        {expandedSections.programs ? 'Скрыть' : 'Показать'}
                    </Button>
                </div>
            </CardHeader>

            {expandedSections.programs && (
                <CardContent className="space-y-3">
                    {programs && programs.length > 0 ? (
                        <div className="grid gap-3">
                            {programs.map((program, index) => (
                                <div
                                    key={`participant-${id}-program-${index}`}
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                                >
                                    <div className="flex-1">
                                        {program.type && (
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    <p className="text-sm font-medium break-words whitespace-normal">
                                                        {program.type}
                                                    </p>
                                                </Badge>
                                            </div>
                                        )}
                                        <p className="text-sm font-medium break-words whitespace-normal">
                                            {program.value}
                                        </p>
                                    </div>
                                    {/* <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleRemoveProgram(index)
                                        }
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button> */}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">
                                {isPpk
                                    ? 'Нет ППК программ'
                                    : 'Нет дней участия из заявки'}
                            </p>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
};
