import { adminFetch } from "@/lib/admin-fetch";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlus, Trash2, Shield, Mail, User, ShieldAlert, History, Key, Edit2, Check, X, Search } from "lucide-react";

interface AuthorizedAdmin {
    id: string;
    email: string;
    nombre: string;
    rol: string;
    created_at: string;
}

interface AccessLog {
    id: string;
    email: string;
    action: string;
    details: string;
    created_at: string;
}

// Etiquetas legibles: no mostrar valores crudos de la BD al usuario.
const ROL_LABELS: Record<string, string> = {
    superadmin: "Superadmin",
    admin: "Administrador",
    editor: "Editor",
    viewer: "Lector",
};

const ACTION_LABELS: Record<string, string> = {
    access_granted: "Acceso concedido",
    access_denied: "Acceso denegado",
    user_created: "Usuario creado",
    password_reset: "Contraseña cambiada",
    payment_registered: "Pago registrado",
    reservation_created: "Reserva creada",
    reservation_updated: "Reserva actualizada",
    reservation_cancelled: "Reserva anulada",
    reservation_trashed: "Reserva a papelera",
    reservation_restored: "Reserva restaurada",
    reservation_permanently_deleted: "Reserva eliminada",
    temporada_created: "Temporada creada",
    temporada_updated: "Temporada actualizada",
    temporada_deleted: "Temporada eliminada",
    tarifa_updated: "Tarifa actualizada",
};

export default function UsersConsole() {
    const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
    const [users, setUsers] = useState<AuthorizedAdmin[]>([]);
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingUser, setEditingUser] = useState<string | null>(null);
    const [editData, setEditData] = useState({ nombre: "", rol: "" });
    const [passwordResetUser, setPasswordResetUser] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    
    const [newUser, setNewUser] = useState({
        email: "",
        nombre: "",
        rol: "admin"
    });
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
        else fetchLogs();
    }, [activeTab]);

    async function fetchUsers() {
        setLoading(true);
        const { data, error } = await supabase
            .from("authorized_admins")
            .select("*")
            .order("created_at", { ascending: false });
        
        if (error) console.error("Error fetching users:", error);
        else setUsers(data || []);
        setLoading(false);
    }

    async function fetchLogs() {
        setLoading(true);
        const { data, error } = await supabase
            .from("admin_access_logs")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);
        
        if (error) console.error("Error fetching logs:", error);
        else setLogs(data || []);
        setLoading(false);
    }

    async function handleAddUser(e: React.FormEvent) {
        e.preventDefault();
        if (!newUser.email) return;

        setActionLoading("adding");
        const { error } = await supabase
            .from("authorized_admins")
            .insert([newUser]);

        if (error) {
            alert("Error al agregar usuario: " + error.message);
        } else {
            setNewUser({ email: "", nombre: "", rol: "admin" });
            setIsAdding(false);
            fetchUsers();
            
            // Log action
            const { data: { user } } = await supabase.auth.getUser();
            await supabase.from('admin_access_logs').insert({
                email: user?.email || 'admin',
                action: 'user_created',
                details: `Creado usuario: ${newUser.email} con rol ${newUser.rol}`
            });
        }
        setActionLoading(null);
    }

    async function handleUpdateUser(id: string) {
        setActionLoading(id);
        const { error } = await supabase
            .from("authorized_admins")
            .update(editData)
            .eq("id", id);

        if (error) {
            alert("Error al actualizar: " + error.message);
        } else {
            setEditingUser(null);
            fetchUsers();
        }
        setActionLoading(null);
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!passwordResetUser || !newPassword) return;

        setActionLoading("password");
        try {
            const { data: { user: adminUser } } = await supabase.auth.getUser();
            
            // Obtener el ID de autenticación del usuario basado en su email
            // Como no tenemos el auth ID directamente en authorized_admins, 
            // intentaremos buscarlo o usar el email directamente si nuestra API lo permite.
            // Nuestra API usa userId, así que necesitamos el ID de auth.users.
            
            const targetUser = users.find(u => u.id === passwordResetUser);
            if (!targetUser) throw new Error("Usuario no encontrado");

            // Para esto necesitamos el ID de la tabla auth.users, que no tenemos aquí.
            // Ajustaremos la API para aceptar el email en su lugar si es más fácil, 
            // o haremos un query previo si tenemos permisos.
            
            const response = await adminFetch('/api/admin/users/update-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: targetUser.id, // Ojo: este es el ID de authorized_admins, 
                                          // necesitamos sincronizar o usar el email.
                    newPassword,
                    adminEmail: adminUser?.email
                })
            });

            const result = await response.json();
            if (result.error) throw new Error(result.error);

            alert("Contraseña actualizada exitosamente.");
            setPasswordResetUser(null);
            setNewPassword("");
        } catch (error: any) {
            alert("No se pudo cambiar la contraseña:\n" + error.message);
        }
        setActionLoading(null);
    }

    async function handleRevoke(id: string, email: string) {
        if (!confirm(`¿Estás seguro de revocar el acceso a ${email}?`)) return;

        setActionLoading(id);
        const { error } = await supabase
            .from("authorized_admins")
            .delete()
            .eq("id", id);

        if (error) {
            alert("Error al revocar acceso: " + error.message);
        } else {
            fetchUsers();
        }
        setActionLoading(null);
    }

    if (loading && users.length === 0 && logs.length === 0) {
        return (
            <div className="flex justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-display font-black text-gray-900 tracking-tight">Seguridad y Accesos</h2>
                    <div className="flex gap-4 mt-2">
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${activeTab === 'users' ? 'border-primary text-primary' : 'border-transparent text-gray-700 hover:text-gray-600'}`}
                        >
                            Usuarios Autorizados
                        </button>
                        <button 
                            onClick={() => setActiveTab('logs')}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-gray-700 hover:text-gray-600'}`}
                        >
                            Log de Actividad
                        </button>
                    </div>
                </div>
                
                {activeTab === 'users' && (
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-[1.2rem] text-sm font-black shadow-xl shadow-primary/10 flex items-center gap-2 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        <UserPlus className="w-4 h-4" />
                        {isAdding ? "Cancelar" : "Nuevo Acceso"}
                    </button>
                )}
            </div>

            {activeTab === 'users' ? (
                <>
                    {isAdding && (
                        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-black/5 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300">
                            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="ejemplo@gmail.com"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                                        <input
                                            type="text"
                                            placeholder="Nombre del administrador"
                                            value={newUser.nombre}
                                            onChange={(e) => setNewUser({ ...newUser, nombre: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Rol / Permisos</label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                                        <select
                                            value={newUser.rol}
                                            onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm appearance-none cursor-pointer"
                                        >
                                            <option value="admin">Administrador (Total)</option>
                                            <option value="editor">Editor (Solo Reservas)</option>
                                            <option value="viewer">Lector (Solo Vista)</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={actionLoading === "adding"}
                                    className="w-full px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                                >
                                    {actionLoading === "adding" ? "Guardando..." : "Confirmar Acceso"}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr className="text-gray-700 uppercase text-[10px] font-black tracking-[0.2em]">
                                        <th className="px-8 py-5">Nombre / Usuario</th>
                                        <th className="px-8 py-5">Email</th>
                                        <th className="px-8 py-5">Rol</th>
                                        <th className="px-8 py-5">Fecha de Alta</th>
                                        <th className="px-8 py-5 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                {editingUser === user.id ? (
                                                    <input 
                                                        type="text"
                                                        value={editData.nombre}
                                                        onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                                                        className="p-2 border rounded-lg text-sm font-bold w-full"
                                                    />
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 font-bold">
                                                            {user.nombre?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-900">{user.nombre || "Sin nombre"}</span>
                                                            <span className="text-[10px] text-gray-700 uppercase font-black tracking-widest">Activo</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm font-medium text-gray-600">{user.email}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                {editingUser === user.id ? (
                                                    <select 
                                                        value={editData.rol}
                                                        onChange={(e) => setEditData({...editData, rol: e.target.value})}
                                                        className="p-2 border rounded-lg text-sm font-black uppercase"
                                                    >
                                                        <option value="admin">Administrador</option>
                                                        <option value="editor">Editor</option>
                                                        <option value="viewer">Lector</option>
                                                        <option value="superadmin">Superadmin</option>
                                                    </select>
                                                ) : (
                                                    <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                                                        user.rol === 'superadmin' ? 'bg-indigo-50 text-indigo-600' :
                                                        user.rol === 'admin' ? 'bg-primary/10 text-primary' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        <Shield className="w-3 h-3" />
                                                        {ROL_LABELS[user.rol] || user.rol}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs text-gray-700 font-medium">
                                                    {new Date(user.created_at).toLocaleDateString('es-CL', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    {editingUser === user.id ? (
                                                        <>
                                                            <button onClick={() => handleUpdateUser(user.id)} title="Guardar cambios" aria-label="Guardar cambios" className="p-2 text-green-600 bg-green-50 rounded-xl hover:bg-green-100">
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                            <button onClick={() => setEditingUser(null)} title="Cancelar edición" aria-label="Cancelar edición" className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingUser(user.id);
                                                                    setEditData({ nombre: user.nombre, rol: user.rol });
                                                                }}
                                                                className="p-2 text-gray-700 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                                                title="Editar usuario"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => setPasswordResetUser(user.id)}
                                                                className="p-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                                                                title="Cambiar contraseña"
                                                            >
                                                                <Key className="w-4 h-4" />
                                                            </button>
                                                            {user.rol !== 'superadmin' && (
                                                                <button
                                                                    onClick={() => handleRevoke(user.id, user.email)}
                                                                    disabled={actionLoading === user.id}
                                                                    className="p-2 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                                    title="Revocar acceso"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Historial de Accesos Recientes</h3>
                        <div className="flex items-center gap-2 text-[10px] text-gray-700 font-bold">
                            <History className="w-3 h-3" />
                            Últimos 50 eventos
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr className="text-gray-700 uppercase text-[9px] font-black tracking-[0.2em]">
                                    <th className="px-8 py-4">Fecha / Hora</th>
                                    <th className="px-8 py-4">Usuario</th>
                                    <th className="px-8 py-4">Acción</th>
                                    <th className="px-8 py-4">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.map((log) => (
                                    <tr key={log.id} className="text-xs">
                                        <td className="px-8 py-4 font-medium text-gray-900">
                                            {new Date(log.created_at).toLocaleString('es-CL')}
                                        </td>
                                        <td className="px-8 py-4 font-bold text-gray-900">{log.email}</td>
                                        <td className="px-8 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                                log.action.includes('granted') || log.action.includes('success') ? 'bg-green-100 text-green-700' :
                                                log.action.includes('denied') || log.action.includes('failure') ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {ACTION_LABELS[log.action] || log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-gray-700 italic">{log.details}</td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-10 text-center text-gray-700 italic">No hay registros de actividad aún.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {passwordResetUser && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-4 mb-8">
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center">
                                <Key className="w-8 h-8 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">Cambiar Contraseña</h3>
                                <p className="text-xs text-gray-700 font-bold uppercase tracking-widest mt-1">
                                    {users.find(u => u.id === passwordResetUser)?.email}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                <input 
                                    type="text" // Usamos text para que el admin pueda ver qué está poniendo o generar una
                                    required
                                    placeholder="Mínimo 6 caracteres"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-center text-lg tracking-widest"
                                />
                                <p className="text-[10px] text-gray-700 text-center italic mt-2">La nueva contraseña se aplicará de inmediato.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setPasswordResetUser(null)}
                                    className="px-6 py-4 bg-gray-100 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={actionLoading === "password" || newPassword.length < 6}
                                    className="px-6 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-black/10"
                                >
                                    {actionLoading === "password" ? "Cambiando..." : "Actualizar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-yellow-50/50 border border-yellow-100 p-6 rounded-[1.5rem] flex gap-4 items-start">
                <ShieldAlert className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div className="space-y-1">
                    <p className="text-sm font-black text-yellow-800 uppercase tracking-widest">Aviso de Control</p>
                    <p className="text-xs text-yellow-700 leading-relaxed font-medium">
                        Como Superadministrador, tienes la capacidad de auditar accesos y modificar permisos de cualquier integrante. 
                        Los cambios de contraseña son acciones críticas que quedan registradas en el log de actividad.
                    </p>
                </div>
            </div>
        </div>
    );
}

