import { TabsContent } from '@/components/ui/tabs';
import { Monitor } from 'lucide-react';
import type { FunctionComponent } from 'react';
import type { IProps } from './ScreenShareTab.types';

export const ScreenShareTab: FunctionComponent<IProps> = ({ device }) => {
    return (
        <TabsContent value="screen" className="mt-6">
            <div className="flex h-96 items-center justify-center rounded-md border border-dashed bg-muted/50">
                <div className="text-center">
                    <Monitor className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        {device.isOnline
                            ? 'WebRTC screen share will appear here.'
                            : 'Agent must be online to start screen share.'}
                    </p>
                </div>
            </div>
        </TabsContent>
    );
};
