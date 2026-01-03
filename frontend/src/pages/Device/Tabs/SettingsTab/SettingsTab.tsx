import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Power, RotateCw, LogOut, AlertTriangle } from 'lucide-react';
import type { IProps } from './SettingsTab.types';
import type { FunctionComponent } from 'react';
import {
    usePostRestart,
    usePostShutdown,
    usePostDisconnect,
    usePostFormat,
} from '@/lib/hooks';
import { useParams } from 'react-router';

export const SettingsTab: FunctionComponent<IProps> = () => {
    const { id } = useParams<{ id: string }>();

    const { mutateAsync: shutdown } = usePostShutdown(id);
    const { mutateAsync: disconnect } = usePostDisconnect(id);
    const { mutateAsync: restart } = usePostRestart(id);
    const { mutateAsync: format } = usePostFormat(id);
    const handleAction = async (
        action: 'disconnect' | 'restart' | 'shutdown' | 'format'
    ) => {
        switch (action) {
            case 'shutdown':
                await shutdown();
                toast.success('Device is shutting down.');
                return;
            case 'disconnect':
                await disconnect();
                toast.success('Device is disconnecting.');
                return;
            case 'restart':
                await restart();
                toast.success('Device is restarting.');
                return;
            case 'format':
                await format();
                toast.success('Device is formatting.');
                return;
        }
    };

    return (
        <TabsContent value="settings" className="mt-6">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
                {/* Connection */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LogOut className="h-5 w-5" />
                            Connection
                        </CardTitle>
                        <CardDescription>
                            Stop receiving data from this device. You can
                            reconnect later.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    Disconnect
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Disconnect Device?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        The device will stop sending data. You
                                        can reconnect anytime.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() =>
                                            handleAction('disconnect')
                                        }
                                    >
                                        Disconnect
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                {/* Restart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RotateCw className="h-5 w-5" />
                            Restart
                        </CardTitle>
                        <CardDescription>
                            Reboot the device. It will reconnect automatically
                            after ~30s.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    Restart
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Restart Device?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        The device will restart and reconnect
                                        shortly.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleAction('restart')}
                                    >
                                        Restart
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                {/* Shutdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Power className="h-5 w-5" />
                            Shutdown
                        </CardTitle>
                        <CardDescription>
                            Power off the device safely. Requires physical
                            access to turn back on.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full">
                                    Shut Down
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Shut Down Device?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        The device will power off. You’ll need
                                        to turn it on manually.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleAction('shutdown')}
                                    >
                                        Shut Down
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                {/* Format */}
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Format Device
                        </CardTitle>
                        <CardDescription className="text-destructive/80">
                            Permanently erase all data. This action cannot be
                            undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                >
                                    Format
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-destructive">
                                        Format – Irreversible!
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        <Badge
                                            variant="destructive"
                                            className="mb-2"
                                        >
                                            ALL DATA WILL BE ERASED
                                        </Badge>
                                        <br />
                                        This will wipe the entire disk. Only
                                        proceed if you are certain.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() => handleAction('format')}
                                    >
                                        Yes, Format Device
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
    );
};
