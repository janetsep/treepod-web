"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import Navbar from "./Navbar";
import TopBar from "./TopBar";
import LeadMagnet from "./LeadMagnet";
import WhatsAppButton from "./WhatsAppButton";

export default function AdminAwareLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith("/admin");
    const isLogin = pathname?.startsWith("/login");

    // Si estamos en admin o login, NO mostramos la navegación del sitio
    if (isAdmin || isLogin) {
        return <>{children}</>;
    }

    // Layout estándar del sitio web
    return (
        <>
            <TopBar />
            <Navbar />
            <LeadMagnet />
            <WhatsAppButton />
            {children}
            <Footer />
        </>
    );
}
