"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";


export default function AdminLogin() {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push("/admin");
            } else if (mode === 'signup') {
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;

                // Notificar a Janet sobre el nuevo registro (vía API segura)
                try {
                    await fetch("/api/admin/security-alert", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ type: 'signup', email })
                    });
                } catch (e) {
                    console.error("Error al notificar registro:", e);
                }

                if (data.user && !data.session) {
                    setMessage("¡Cuenta creada! Se ha notificado a la administración para su aprobación.");
                } else {
                    router.push("/admin");
                }
            } else {
                // Forgot Password mode
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/admin/reset-password`,
                });
                if (error) throw error;
                setMessage("Se ha enviado un correo para restablecer tu contraseña.");
            }
        } catch (err: any) {
            setError(err.message || "Error en el proceso");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
                <div className="text-center space-y-3">
                    <img src="/images/branding/logo-treepod.jpg" alt="Domos TreePod" className="h-16 w-16 object-contain mx-auto" />
                    <h1 className="text-2xl font-display font-bold text-gray-900">
                        {mode === 'login' ? 'TreePod Admin' : mode === 'signup' ? 'Crear Cuenta' : 'Recuperar Acceso'}
                    </h1>
                    <p className="text-sm text-gray-900">
                        {mode === 'login' ? 'Ingresa tus credenciales para acceder' :
                            mode === 'signup' ? 'Registra un nuevo usuario administrador' : 'Ingresa tu correo para recibir un enlace de recuperación'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="admin@domostreepod.cl"
                        />
                    </div>

                    {mode !== 'forgot-password' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">Contraseña</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg font-medium flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        {loading ? "Procesando..." : (
                            mode === 'login' ? "Iniciar Sesión" :
                                mode === 'signup' ? "Registrar Administrador" : "Enviar Enlace de Recuperación"
                        )}
                    </button>
                </form>

                <div className="text-center pt-2 space-y-3">
                    {mode === 'login' && (
                        <button
                            onClick={() => { setMode('forgot-password'); setError(null); setMessage(null); }}
                            className="block w-full text-xs text-gray-700 hover:text-primary transition-colors font-medium"
                        >
                            ¿Has olvidado tu contraseña?
                        </button>
                    )}

                    {/* Solo permitimos ver el link de registro si se pasa un parámetro secreto por URL para seguridad */}
                    {typeof window !== 'undefined' && window.location.search.includes('treepod_signup_enabled=true') && (
                        <button
                            onClick={() => {
                                if (mode === 'login') setMode('signup');
                                else setMode('login');
                                setError(null);
                                setMessage(null);
                            }}
                            className="text-sm text-primary font-bold hover:underline"
                        >
                            {mode === 'login' ? '¿No tienes cuenta? Crear una' : 'Volver al Inicio de Sesión'}
                        </button>
                    )}

                    {mode === 'login' && typeof window !== 'undefined' && !window.location.search.includes('treepod_signup_enabled=true') && (
                        <p className="text-xs text-gray-700">Sistema restringido a administradores autorizados.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
