import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
  darkMode?: boolean; // Nouvelle prop optionnelle
}

export function AuthForm({ onSignIn, onSignUp, darkMode = true }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = isSignUp
      ? await onSignUp(email, password)
      : await onSignIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50'
    }`}>
      <div className={`rounded-2xl shadow-2xl p-8 w-full max-w-md border transition-colors duration-300 ${
        darkMode 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-center mb-8">
          <div className={`p-3 rounded-xl ${
            darkMode 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500' 
              : 'bg-gradient-to-r from-blue-400 to-cyan-400'
          }`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        </div>

        <h1 className={`text-3xl font-bold text-center mb-2 transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>
          Bibliothèque de Films
        </h1>
        <p className={`text-center mb-8 transition-colors duration-300 ${
          darkMode ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {isSignUp ? 'Créer un compte' : 'Connectez-vous pour continuer'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
              darkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={`w-full px-4 py-3 border rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ${
                darkMode 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className={`px-4 py-3 rounded-lg text-sm transition-colors duration-300 ${
              darkMode 
                ? 'bg-red-500/10 border border-red-500/50 text-red-400' 
                : 'bg-red-100 border border-red-200 text-red-600'
            }`}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              darkMode 
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' 
                : 'bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500'
            }`}
          >
            {loading ? (
              <div className={`w-5 h-5 border-2 rounded-full animate-spin ${
                darkMode 
                  ? 'border-white border-t-transparent' 
                  : 'border-white border-t-transparent'
              }`} />
            ) : (
              <>
                {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                {isSignUp ? "S'inscrire" : 'Se connecter'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className={`text-sm transition-colors duration-300 hover:underline ${
              darkMode 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-500 hover:text-blue-600'
            }`}
          >
            {isSignUp
              ? 'Déjà un compte ? Se connecter'
              : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}