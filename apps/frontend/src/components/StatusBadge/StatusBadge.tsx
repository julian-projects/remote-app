import { Badge } from "../ui/badge.tsx";
import { type IProps } from "./StatusBadge.types.ts";

export const StatusBadge = ({ status }: IProps) => {
    const statusVariantMap: Record<string, string> = {
        online: "default",
        offline: "secondary",
        lost_connection: "destructive",
    };

    const statusColorMap: Record<string, string> = {
        online: "bg-green-500",
        offline: "bg-gray-400",
        lost_connection: "bg-red-500",
    };
    const variant = statusVariantMap[status] ?? "outline";
    const dotColor = statusColorMap[status] ?? "bg-gray-300";
    const label = status.replace(/_/g, " ");
    return (
        <Badge
            variant={variant as any}
            className="flex items-center gap-1.5 capitalize font-medium text-xs"
        >
            <div className={`size-2 rounded-full animate-pulse ${dotColor}`} />
            {label}
        </Badge>
    );
};
