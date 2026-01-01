import { useParams, useNavigate } from 'react-router-dom';

import 'xterm/css/xterm.css';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Laptop } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Tabs } from './Tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { useGetDevice } from '@/lib/hooks';
import { CustomTerminal } from './CustomTerminal';

dayjs.extend(relativeTime);

export const Device = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: selectedDevice } = useGetDevice(id || '');

    if (!selectedDevice) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">
                    Device not found or offline.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen  bg-slate-950 p-6">
            <div className="max-w-440 mx-auto space-y-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Devices
                </Button>
                <div className="flex gap-5 items-start w-full">
                    <Card className="flex-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Laptop className="h-6 w-6" />
                                {selectedDevice.hostname}
                                <StatusBadge status={selectedDevice.status} />
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <Tabs />
                        </CardContent>
                    </Card>
                    <CustomTerminal />
                </div>
            </div>
        </div>
    );
};
