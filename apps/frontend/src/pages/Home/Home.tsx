import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Header } from './Header';
import { Devices } from './Devices';
import { Card } from '@/components/ui/card';
dayjs.extend(relativeTime);

export const Home = () => {
    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-440 mx-auto space-y-3">
                <Card>
                    <Header />
                    <Devices />
                </Card>
            </div>
        </div>
    );
};
