import Image from 'next/image';
import Link from 'next/link';

export const Upgrade = () => {
    return (
        <div className="flex items-center gap-2 mt-3 p-3 bg-[#ecf2ff] rounded-lg">
            <div>
                <div className="text-base font-semibold text-black mb-1">Haven&apos;t account ?</div>
                <Link href="/authentication/register" target="_blank" aria-label="signup" className="inline-flex items-center justify-center rounded-md bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white px-3 py-2 text-sm">
                    Sign Up
                </Link>
            </div>
            <div className="-mt-9">
                <Image alt="Rocket" src='/images/backgrounds/rocket.png' width={100} height={100} />
            </div>
        </div>
    );
};
