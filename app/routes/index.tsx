import { Link } from "@remix-run/react";
import Alert from "~/components/Alert";
import { ERROR_UNEXPECTED } from "~/data/constants";

export default function Index() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col lg:flex-row">
        <div>
          <h1 className="font-extrabold text-5xl">¡Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Remix ERP</span>!</h1>
          <p className="py-6">Gestiona tus empresas, sedes, módulos, catálogos y configura quién puede acceder a los mismos.</p>
          <Link to="/dashboard" className="btn btn-primary">Comenzar
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
      <Alert type="alert-error">{ERROR_UNEXPECTED}</Alert>
  )
}