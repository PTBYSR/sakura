import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

export const Upgrade = () => {
    return (
        <div className="flex items-center gap-2 mt-3 p-3 bg-[#ecf2ff] rounded-lg">
            <div>
                <div className="text-base font-semibold text-black mb-1">Haven&apos;t account ?</div>
                <Button asChild className="text-white">
                    <Link href="/authentication/register" target="_blank" aria-label="signup">Sign Up</Link>
                </Button>
            </div>
            <div className="-mt-9">
                <Image alt="Rocket" src='/images/backgrounds/rocket.png' width={100} height={100} />
            </div>
        </div>
    );
};
