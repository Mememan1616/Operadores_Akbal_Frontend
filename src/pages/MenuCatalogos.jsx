import React from 'react';
import { 
  Users, 
  Settings, 
  Clock, 
  AlertOctagon, 
  ClipboardList, 
  ActivitySquare,
  LogOut,
  LayoutDashboard
} from 'lucide-react';

const Catalogo = () => {
  // Arreglo de datos sin las clases del modo oscuro
  const menuOptions = [
    { 
      id: 'usuarios', 
      title: 'Usuarios', 
      icon: Users, 
      color: 'bg-blue-500 hover:bg-blue-600',
      shadow: 'shadow-blue-500/40'
    },
    { 
      id: 'maquina', 
      title: 'Máquina', 
      icon: Settings, 
      color: 'bg-indigo-500 hover:bg-indigo-600',
      shadow: 'shadow-indigo-500/40'
    },
    { 
      id: 'turnos', 
      title: 'Turnos', 
      icon: Clock, 
      color: 'bg-violet-500 hover:bg-violet-600',
      shadow: 'shadow-violet-500/40'
    },
    { 
      id: 'paros', 
      title: 'Paros', 
      icon: AlertOctagon, 
      color: 'bg-rose-500 hover:bg-rose-600',
      shadow: 'shadow-rose-500/40'
    },
    { 
      id: 'registro-paros', 
      title: 'Registro de Paros', 
      icon: ClipboardList, 
      color: 'bg-orange-500 hover:bg-orange-600',
      shadow: 'shadow-orange-500/40'
    },
    { 
      id: 'registro-actividad', 
      title: 'Registro de Actividad', 
      icon: ActivitySquare || ClipboardList, 
      color: 'bg-emerald-500 hover:bg-emerald-600',
      shadow: 'shadow-emerald-500/40'
    }
  ];

  // Función simulada para la navegación
  const handleNavigation = (ruta) => {
  };

  const handleLogout = () => {
    // Lógica para cerrar sesión
  };

  return (
    <div className="w-full flex-1 flex flex-col text-slate-800 transition-colors duration-300 font-sans">
      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 pb-16">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {menuOptions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`
                    group flex flex-col items-center justify-center text-white
                    ${item.color} 
                    p-8 md:p-12 rounded-3xl shadow-lg
                    transition-all duration-200 ease-in-out
                    transform hover:-translate-y-2 hover:shadow-2xl ${item.shadow}
                    active:scale-95 
                    focus:outline-none focus:ring-4 focus:ring-white/50
                  `}
                >
                  <Icon size={64} strokeWidth={1.5} className="mb-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="text-xl md:text-2xl font-bold text-center leading-tight">
                    {item.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
      
    </div>
  );
};

export default Catalogo;