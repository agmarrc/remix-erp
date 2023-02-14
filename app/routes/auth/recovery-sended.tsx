import { Link } from "@remix-run/react";

export default function RecoverySended() {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <h1 className="text-5xl font-bold">Enalce enviado</h1>
                    <p className="py-6">Se ha enviado un enlace de restablecimiento de contraseña al correo que proporcionaste.</p>
                    <Link to="/auth/login" className="btn btn-primary">Volver a inicio</Link>
                </div>
            </div>
        </div>
    );
}