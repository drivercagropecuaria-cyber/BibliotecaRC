import React from 'react';

const searilizeError = (error: any) => {
  if (error instanceof Error) {
    return error.message + '\n' + error.stack;
  }
  return JSON.stringify(error, null, 2);
};

const isDev = import.meta.env.DEV;

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-emerald-950/20 p-6 flex items-center justify-center">
          <div className="max-w-2xl w-full glass-card border border-red-500/30 p-6">
            <h2 className="text-red-200 font-semibold mb-2">Erro ao carregar o aplicativo</h2>
            <p className="text-sm text-rc-text-muted mb-4">Ocorreu um erro inesperado. Atualize a página ou tente novamente.</p>
            {(isDev || this.state.error) && (
              <pre className="mt-2 text-xs bg-red-500/10 text-red-200 p-3 rounded overflow-x-auto">
                {searilizeError(this.state.error)}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 rounded-lg bg-red-500/80 text-white text-sm"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
