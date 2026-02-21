import Image from "next/image";

export default function Logo({ className = "h-12 w-auto", variant = "white" }: { className?: string; variant?: "white" | "color" }) {
    return (
        <div className={`relative ${className}`}>
            {/* Color Version (Constructed via Mask) */}
            <div
                className={`absolute inset-0 bg-primary transition-opacity duration-500 ${variant === 'color' ? 'opacity-100 ease-in' : 'opacity-0 ease-out'}`}
                style={{
                    maskImage: "url('/images/branding/logo-white.png')",
                    WebkitMaskImage: "url('/images/branding/logo-white.png')",
                    maskSize: "contain",
                    WebkitMaskSize: "contain",
                    maskRepeat: "no-repeat",
                    WebkitMaskRepeat: "no-repeat",
                    maskPosition: "center",
                    WebkitMaskPosition: "center"
                }}
            />

            {/* White Version (Standard Image) */}
            <Image
                src="/images/branding/logo-white.png"
                alt="TreePod Logo White"
                fill
                className={`object-contain transition-opacity duration-500 absolute inset-0 ${variant === 'white' ? 'opacity-100 ease-in' : 'opacity-0 ease-out'}`}
                priority
            />
        </div>
    );
}
