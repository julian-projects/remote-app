import {
    Tabs as CustomTabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { Info, Monitor, Settings } from 'lucide-react';
import { InfoTab } from './InfoTab';
import { ScreenShareTab } from './ScreenShareTab';
import { SettingsTab } from './SettingsTab';
import { useGetDevice } from '@/lib/hooks';
import { useParams } from 'react-router-dom';

export const Tabs = () => {
    const { id } = useParams<{ id: string }>();
    const { data: device } = useGetDevice(id || '');

    return (
        <CustomTabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">
                    <Info className="mr-2 h-4 w-4" />
                    Info
                </TabsTrigger>
                <TabsTrigger value="screen">
                    <Monitor className="mr-2 h-4 w-4" />
                    Screen Share
                </TabsTrigger>
                <TabsTrigger value="settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                </TabsTrigger>
            </TabsList>

            <InfoTab device={device} />
            <ScreenShareTab device={device} />
            <SettingsTab device={device} />
        </CustomTabs>
    );
};
