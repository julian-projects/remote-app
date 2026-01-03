import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '@/components/StatusBadge';
import { useDevicesContext } from './DevicesContext';

export const Devices = () => {
    const navigate = useNavigate();
    const { devices, loading } = useDevicesContext();

    const goToDevice = (id: string) => navigate(`/device/${id}`);

    return (
        <CardContent className="px-0 pb-0">
            {devices.length === 0 ? (
                loading === true ? (
                    <div className="w-full flex justify-center items-center">
                        <Spinner className="size-8" />
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-10">
                        No devices connected. Start your agent!
                    </p>
                )
            ) : (
                <div className="overflow-hidden rounded-b-lg border-t">
                    <Table>
                        {/* Header */}
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="font-semibold px-4 py-3">
                                    Device ID
                                </TableHead>
                                <TableHead className="font-semibold px-4 py-3">
                                    Last Seen
                                </TableHead>
                                <TableHead className="font-semibold px-4 py-3">
                                    Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {devices.map((device) => {
                                return (
                                    <TableRow
                                        key={device.id}
                                        className="cursor-pointer transition-colors hover:bg-muted/40"
                                        onClick={() => goToDevice(device.id)}
                                    >
                                        <TableCell className="font-medium px-4 py-3">
                                            {device.deviceId}
                                        </TableCell>

                                        <TableCell className="text-muted-foreground px-4 py-3">
                                            {device.lastSeen}
                                        </TableCell>

                                        <TableCell className="px-4 py-3">
                                            <StatusBadge
                                                status={device.status}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
    );
};
