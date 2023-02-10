import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row">
        <img src="https://picsum.photos/400" className="max-w-sm rounded-lg shadow-2xl" />
        <div>
          <h1 className="font-extrabold text-5xl">¡Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Remix ERP</span>!</h1>
          <p className="py-6">Gestiona tus empresas, sedes, módulos, catálogos y configura quién puede acceder a los mismos.</p>
          <Link to="/dashboard" className="btn btn-primary">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
