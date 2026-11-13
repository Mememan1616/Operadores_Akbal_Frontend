// src/auth/Auth.jsx
import React, { useState, createContext, useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom'; // IMPORTANTE: Para redireccionar
import { AlertTriangle, Lock, LogIn } from 'lucide-react';
import { ApiService } from '../services/ApiService';

// 1. EXPORTAMOS EL CONTEXTO (Para que App.jsx lo pueda leer)
export const AuthContext = createContext(null);

// 2. EXPORTAMOS EL PROVEEDOR (Para envolver la app)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const userGuardado = localStorage.getItem('user');
      return userGuardado ? JSON.parse(userGuardado) : null;
    } catch (error) {
      console.error("Error leyendo usuario de localStorage", error);
      return null;
    }
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. EXPORTAMOS POR DEFECTO LA PANTALLA DE LOGIN
export default function LoginScreen() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate(); // Hook para cambiar de ruta
  const {AuthProvider} = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async(e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    
    const response =await ApiService.login(username);//verificaCredenciales(username);
      if (response.result.status === 200) {
        login(response.result.user);
        navigate('/inicio-produccion', { replace: true }); 
        
      } else {
        setError('Clave Incorrecta');
        setIsLoading(false);
      }
    
  };
  

  // Si ya hay sesión activa, el login no es una pantalla válida.
  if (user) {
    return <Navigate to="/inicio-produccion" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full text-white mb-4 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Iniciar Sesión</h2>
          <p className="text-slate-500 mt-2 text-center">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        {error && (
          <div className="bg-rose-100 text-rose-700 p-4 rounded-xl mb-6 flex items-center text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2">Clave de Trabajador</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-4 text-lg bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 outline-none transition-colors"
              placeholder="EJ: 123456789"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center text-lg transition-colors shadow-md active:scale-95"
          >
            {isLoading ? 'Verificando...' : (
              <>
                <LogIn className="w-6 h-6 mr-2" />
                Ingresar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}