import { useNavigate } from "react-router-dom";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const navigation = [
  { name: "Entrenamientos", href: "#" },
  { name: "Mi Ciclo", href: "#" },
];

export default function Index() {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Disclosure
        as="header"
        className="border-b border-border bg-card/50 backdrop-blur-sm"
      >
        {({ open }) => (
          <>
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-primary">
                  Ciclos y Cargas
                </h1>
                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                  <a
                    href={navigation[0].href}
                    className="text-primary text-lg font-semibold hover:text-primary/80 transition-colors"
                  >
                    {navigation[0].name}
                  </a>
                  <a
                    href={navigation[1].href}
                    className="text-primary text-lg font-semibold hover:text-primary/80 transition-colors min-w-[120px] text-center"
                  >
                    {navigation[1].name}
                  </a>
                  <button
                    className="iniciarSesion block text-destructive text-lg font-semibold hover:text-destructive/80 transition-colors py-2 text-center"
                    onClick={handleClick}
                  >
                    Iniciar Sesión
                  </button>
                </nav>
                {/* Mobile menu button */}
                <div className="md:hidden">
                  <DisclosureButton className="p-2 rounded-md text-muted-foreground hover:bg-card hover:text-foreground focus:outline-none">
                    {open ? (
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
              </div>
            </div>
            {/* Mobile Nav */}
            <DisclosurePanel className="md:hidden">
              <nav className="px-4 pb-4 flex flex-col gap-2 items-center">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block text-muted-foreground hover:text-foreground transition-colors py-2 text-center w-full"
                  >
                    {item.name}
                  </a>
                ))}
                <button
                  className="iniciarSesion cursor-pointer whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                  onClick={handleClick}
                >
                  Iniciar Sesión
                </button>
              </nav>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Hero Section */}
      <section className="py-6 lg:py-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-6xl font-bold text-balance leading-tight">
                  Entrena al máximo gracias a tu{" "}
                  <span className="text-primary">ciclo menstrual</span>
                </h2>
                <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
                  Optimiza tu rendimiento deportivo adaptando tus entrenamientos
                  a cada fase de tu ciclo. Ciencia, fuerza y bienestar femenino
                  en una sola aplicación.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
                  Comenzar Ahora
                </button>
                <button className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-11 px-8">
                  Ver Demo
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-110"></div>
                <img
                  src="/female-soccer-player-silhouette-f35580-md.png"
                  alt="Silueta de deportista femenina"
                  width={400}
                  height={400}
                  className="relative z-10 w-80 h-80 lg:w-96 lg:h-96 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Cards */}
      <section className="py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card 1 */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
              <div className="pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold leading-none tracking-tight">
                  Entrena Inteligentemente
                </h3>
              </div>
              <div>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Descubre cómo las diferentes fases de tu ciclo menstrual
                  afectan tu fuerza, resistencia y recuperación. Nuestros planes
                  de entrenamiento se adaptan automáticamente para maximizar tu
                  rendimiento en cada momento del mes.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
              <div className="pb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold leading-none tracking-tight">
                  Cuida tu Bienestar
                </h3>
              </div>
              <div>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Más que entrenamientos, es un enfoque integral de tu salud.
                  Recibe recomendaciones personalizadas sobre nutrición,
                  descanso y manejo de síntomas para que te sientas fuerte y
                  empoderada todos los días.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-primary mb-4">
              CycleStrong
            </h3>
            <p className="text-muted-foreground">
              Empoderando a las deportistas a través de la ciencia y el
              autoconocimiento
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
