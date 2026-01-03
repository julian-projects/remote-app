import { Badge } from '../ui/badge.tsx';
import { type IProps } from './StatusBadge.types.ts';

export const StatusBadge = ({ status }: IProps) => {
    const statusVariantMap: Record<string, string> = {
        0: 'secondary',
        1: 'warning',
        2: 'destructive',
        3: 'success',
    };

    const statusColorMap: Record<string, string> = {
        0: 'bg-gray-300',
        1: 'bg-yellow-500',
        2: 'bg-red-500',
        3: 'bg-green-500',
    };
    const statusTextMap: Record<string, string> = {
        0: 'offline',
        1: 'sleep',
        2: 'shutdown',
        3: 'online',
    };
    // 0=offline, 1=sleep, 2=shutdown, 3=online
    const variant = statusVariantMap[status] ?? 'outline';
    const dotColor = statusColorMap[status] ?? 'bg-gray-300';
    return (
        <Badge
            variant={variant as any}
            className="flex items-center gap-1.5 capitalize font-medium text-xs"
        >
            <div className={`size-2 rounded-full animate-pulse ${dotColor}`} />
            {statusTextMap[status] ?? status}
        </Badge>
    );
};
