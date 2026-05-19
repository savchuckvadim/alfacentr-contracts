'use client';
import { LiquidEther } from "@workspace/ui/components/LiquidEther/LiquidEther";
import { ProcessingDots } from "./ProcessingDots/ProcessingDots";

export const Processing = () => {


    return (
        <div className="fixed inset-0 backdrop-blur-xl flex items-center justify-center z-50 w-screen h-screen" >

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
                <div className="text-primary p-10 rounded-[18px] w-[340px]">
                    <ProcessingDots />
                </div>
            </div>
            {/* <div className="bg-background text-primary p-10 rounded-[18px] w-[340px]">
                <ProcessingDots />
            </div> */}
        </div>
    );
};
