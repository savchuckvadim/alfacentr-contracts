'use client';
import { Button } from '@workspace/ui/components/button';
import { LiquidEther } from '@workspace/ui/components/LiquidEther/LiquidEther';
import Link from 'next/link';

import type { ReactElement } from 'react';

export default function Page(): ReactElement {
    return (
        <div className="w-screen h-screen flex items-center justify-center" style={{ position: 'relative' }}>
            <LiquidEther
                colors={['#5227FF', '#FF9FFC', '#B497CF']}
                mouseForce={20}
                cursorSize={100}
                isViscous
                viscous={30}
                iterationsViscous={32}
                iterationsPoisson={32}
                resolution={0.5}
                isBounce={false}
                autoDemo
                autoSpeed={0.5}
                autoIntensity={2.2}
                takeoverDuration={0.25}
                autoResumeDelay={3000}
                autoRampDuration={0.6}



            />
            <div className="absolute bottom-10 right-10 h-screen w-screen background-none flex items-center justify-center">
                <Link href="/bitrix/main" className="">
                    <Button variant="default" className="w-[200px] h-[50px]"> Начать</Button>
                </Link>
            </div>

        </div>

        // <div className="min-h-screen bg-gradient-to-br from-background to-primary/30  flex items-center justify-center p-4">
        //     <LiquidEther />
        //     <Link href="/bitrix/main">
        //         <Button variant="default"> Начать</Button>
        //     </Link>
        // </div>
    );
}
