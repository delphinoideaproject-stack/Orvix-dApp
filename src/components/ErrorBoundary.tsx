import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold mb-2">Terjadi Kesalahan di Aplikasi</h1>
            <p className="text-slate-400 text-sm mb-6">
              {this.state.error?.message || 'Aplikasi mengalami kendala saat dimuat.'}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-cyan-500/20"
            >
              Muat Ulang & Reset Cache
            </button>
          </div>
        </div>
      );
    }

    return this.renderChildren();
  }

  private renderChildren() {
    return this.childrenContent();
  }

  // Helper method to satisfy TS return type
  private childrenContent(): ReactNode {
    return this.props.children;
  }
}
