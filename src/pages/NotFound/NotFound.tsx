import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center px-6">
      <p className="font-mono text-blue-400 text-sm mb-4">erro 404</p>
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
        Página não <span className="text-blue-400">encontrada</span>
      </h1>
      <p className="text-gray-400 text-lg mb-8 max-w-md">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <Link
        to="/"
        className="btn-shine px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors duration-300"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
