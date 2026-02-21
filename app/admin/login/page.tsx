"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";


export default function AdminLogin() {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
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
            } else {
                const { error, data } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user && !data.session) {
                    setMessage("¡Cuenta creada! Por favor revisa tu correo para confirmar tu cuenta.");
                } else {
                    // Auto login if confirmation not required
                    router.push("/admin");
                }
            }
        } catch (err: any) {
            setError(err.message || "Error de autenticación");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-display font-bold text-gray-900">
                        {mode === 'login' ? 'TreePod Admin' : 'Crear Cuenta Admin'}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {mode === 'login' ? 'Ingresa tus credenciales para acceder' : 'Registra un nuevo usuario administrador'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="admin@treepod.cl"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

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
                        {loading ? "Procesando..." : (mode === 'login' ? "Iniciar Sesión" : "Registrar Administrador")}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); setMessage(null); }}
                        className="text-sm text-primary font-bold hover:underline"
                    >
                        {mode === 'login' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Iniciar Sesión'}
                    </button>
                </div>
            </div>
        </div>
    );
}
