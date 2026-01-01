import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Laptop } from 'lucide-react';
import { useDevicesContext } from './DevicesContext';

export const Header = () => {
    const { devices } = useDevicesContext();

    return (
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <span className="p-2 rounded-xl bg-primary/10">
                        <Laptop className="w-5 h-5 text-primary" />
                    </span>
                    My Devices
                </CardTitle>

                <CardDescription className="text-muted-foreground">
                    {devices.length} device
                    {devices.length !== 1 ? 's' : ''} connected
                </CardDescription>
            </div>

            <Input
                type="text"
                placeholder="Search devices..."
                className="w-56"
            />
        </CardHeader>
    );
};
