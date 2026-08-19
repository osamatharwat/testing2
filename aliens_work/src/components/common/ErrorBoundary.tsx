import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="glass-panel p-8 rounded-3xl border border-rose-500/40 text-center max-w-lg space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white">
                {this.props.fallbackTitle || 'حدث تنبيه غير متوقع أثناء معالجة البيانات'}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                تم احتواء الخطأ البرمجي بأمان. يمكنك إعادة تحميل الصفحة أو الرجوع للرئيسية لمتابعة العمل بدون فقدان البيانات.
              </p>
              {this.state.error && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-28" dir="ltr">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#39ff14] text-slate-950 font-black text-xs flex items-center gap-2 hover:brightness-110 shadow-lg shadow-[#39ff14]/20 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة تحميل الصفحة</span>
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-slate-200 font-black text-xs flex items-center gap-2 hover:bg-white/15 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>الصفحة الرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
