import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    await logout();
    navigate("/");
  };

  const location = useLocation();

  const navItemsPF = [
    {
      name: "Jugadoras Aptas",
      href: "/jugadorasaptas",
      current: location.pathname === "/jugadorasaptas",
    },
    {
      name: "Percepción del Entrenamiento",
      href: "/jugadorasesfuerzo",
      current: location.pathname === "/jugadorasesfuerzo",
    },
    {
      name: "Historial de Percepción",
      href: "/historial-percepcion",
      current: location.pathname === "/historial-percepcion",
    },
    {
      name: "Tipo de Semana",
      href: "/tiposemana",
      current: location.pathname === "/tiposemana",
    },
    {
      name: "Semana a Trabajar",
      href: "/semanatrabajar",
      current: location.pathname === "/semanatrabajar",
    },
  ];

  const navItemsJugadora = [
    {
      name: "Formulario Mensual",
      href: "/formjugadora",
      current: location.pathname === "/formjugadora",
    },
    {
      name: "Percepción del Entrenamiento",
      href: "/formpercepcion",
      current: location.pathname === "/formpercepcion",
    },
  ];

  const userRole = user?.user_metadata?.role;
  const showNavbar = userRole === "PF" || userRole === "Jugadora";
  const navigation = userRole === "PF" ? navItemsPF : navItemsJugadora;

  if (!showNavbar) {
    return null;
  }

  return (
    <Disclosure
      as="nav"
      className="navbar relative bg-gray-800/50 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton
              className="cursor-pointer group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500"
              onClick={(_e) => {
                const userMenu = document.querySelector(
                  '[data-headlessui-state="open"]'
                );
                if (userMenu) {
                  (userMenu as HTMLElement).click();
                }
              }}
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block h-6 w-6 group-data-open:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden h-6 w-6 group-data-open:block"
              />
            </DisclosureButton>
          </div>

          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img
                alt="Your Company"
                src="/female-soccer-player-silhouette-f35580-md.png"
                className="cursor-pointer h-8 w-auto"
                onClick={() => navigate("/navbar")}
              />
            </div>

            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={item.current ? "page" : undefined}
                    className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            <Menu as="div" className="relative ml-3">
              <MenuButton
                className="cursor-pointer relative flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                onClick={(_e) => {
                  const mobileMenuButton = document.querySelector(
                    '[aria-label="Open main menu"]'
                  );
                  if (
                    mobileMenuButton &&
                    mobileMenuButton.getAttribute("data-headlessui-state") ===
                      "open"
                  ) {
                    (mobileMenuButton as HTMLElement).click();
                  }
                }}
              >
                <span className="absolute -inset-1.5" />
                <span className="sr-only">Open user menu</span>
                <div className="flex items-center">
                  {(() => {
                    const avatarUrl =
                      (user?.user_metadata as any)?.avatar_url ||
                      (user?.user_metadata as any)?.picture ||
                      (user as any)?.identities?.[0]?.identity_data
                        ?.avatar_url ||
                      (user as any)?.identities?.[0]?.identity_data?.picture;
                    if (avatarUrl) {
                      return (
                        <img
                          src={avatarUrl}
                          alt="Foto de perfil"
                          referrerPolicy="no-referrer"
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      );
                    }
                    const initials = user?.user_metadata?.name
                      ? `${user.user_metadata.name.charAt(0)}${
                          user.user_metadata.last_name?.charAt(0) || ""
                        }`
                      : user?.email?.charAt(0).toUpperCase() || "U";
                    return (
                      <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white">
                        <span className="text-sm font-medium uppercase">
                          {initials}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </MenuButton>

              <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 outline -outline-offset-1 outline-white/10">
                <MenuItem>
                  <Link
                    to="/editar-perfil"
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                  >
                    Editar Perfil
                  </Link>
                </MenuItem>
                <MenuItem>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
                  >
                    Cerrar Sesión
                  </button>
                </MenuItem>
              </MenuItems>
            </Menu>
          </div>
        </div>
      </div>

      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as={Link}
              to={item.href}
              aria-current={item.current ? "page" : undefined}
              className="block text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-base font-medium"
            >
              {item.name}
            </DisclosureButton>
          ))}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}
