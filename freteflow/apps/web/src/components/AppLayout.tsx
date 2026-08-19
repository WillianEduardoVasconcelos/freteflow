import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

const navigation = [
  { label: "Dashboard", path: "/dashboard", mark: "DB" },
  { label: "Fretes", path: "/fretes", mark: "FR" },
  { label: "Veículos", path: "/veiculos", mark: "VE" },
  { label: "Motoristas", path: "/motoristas", mark: "MO" },
  { label: "Clientes", path: "/clientes", mark: "CL" },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-ink/70 lg:hidden"
          aria-label="Fechar menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-panel px-5 py-6 transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 px-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-mint font-display font-bold text-ink">
            FF
          </span>
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-white">
              FreteFlow
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Operação logística
            </p>
          </div>
        </div>

        <nav className="mt-12 space-y-1" aria-label="Navegação principal">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
            Workspace
          </p>
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `nav-item ${isActive ? "nav-item-active" : ""}`
              }
            >
              <span className="grid h-7 w-7 place-items-center rounded-md border border-current text-[9px] font-bold">
                {item.mark}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-5">
          <button
            className="nav-item w-full text-slate-400 hover:text-coral"
            onClick={handleLogout}
          >
            <span className="grid h-7 w-7 place-items-center rounded-md border border-current text-[9px] font-bold">
              SA
            </span>
            <span>Sair da conta</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 bg-ink/90 px-5 backdrop-blur sm:px-8">
          <div className="flex items-center gap-4">
            <button
              className="icon-button lg:hidden"
              aria-label="Abrir menu"
              onClick={() => setSidebarOpen(true)}
            >
              |||
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber">
                FreteFlow / Operação
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {location.pathname === "/dashboard" || location.pathname === "/"
                  ? "Visão geral"
                  : "Módulo operacional"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-l border-white/10 pl-4 sm:pl-6">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">{user?.nome}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mint">
                {user?.perfil}
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-amber font-display font-bold text-ink">
              {user?.nome?.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="min-h-[calc(100vh-5rem)] px-5 py-8 sm:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
