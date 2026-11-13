import React, { useState } from 'react';
import { LogOut, X, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { ApiService } from '../services/ApiService';
import { useProduccion } from '../context/ProduccionContex';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { claveProduccion } = useProduccion();

  if (!isOpen) return null;

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setError('');
    onClose();
  };

  const authorize = async (user, pass) => {
    // 1. Validar primero si hay una producción activa
    if (claveProduccion) {
      setError(
        `No se puede cerrar sesión. La producción #${claveProduccion} aún está en proceso y debe ser finalizada antes de salir.`
      );
      return;
    }

    // 2. Si no hay producción activa (es null/vacío), validar credenciales
    const response = await ApiService.loginByEmail(user, pass);
    const isSuccess = response?.status === 200 || response?.data?.status === 200;

    if (isSuccess) {
      await onConfirm({ username: user, password: pass, data: response?.data || response });
      handleClose();
    } else {
      setError(response?.message || 'Usuario o contraseña incorrectos.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingresa usuario y contraseña.');
      return;
    }

    try {
      setLoading(true);
      await authorize(username.trim(), password.trim());
    } catch (err) {
      console.error('Error durante la autorización:', err);
      const serverMessage = err?.response?.data?.message || err?.message;
      setError(serverMessage || 'Error al validar credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl border border-slate-100">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 text-red-600">
            <div className="p-2 bg-red-100 rounded-xl">
              <LogOut size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Cerrar Sesión</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600">
            Confirma tus credenciales para proceder con el cierre de sesión del puesto.
          </p>

          {/* Advertencia preventiva si detecta producción abierta */}
          {claveProduccion && (
            <div className="flex items-start gap-2 p-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>
                Existe una producción en curso (<strong>ID: {claveProduccion}</strong>). Debes concluirla antes de cerrar sesión.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Usuario / Correo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                disabled={loading || Boolean(claveProduccion)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading || Boolean(claveProduccion)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || Boolean(claveProduccion)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-xl transition-all shadow-md shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{loading ? 'Validando...' : 'Confirmar salida'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}