import React from 'react';
import { Terminal } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Visualizer crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center" style={{ background: '#110000', border: '1px solid #ff0000', margin: '20px', borderRadius: '8px' }}>
          <Terminal size={32} color="#ff0000" />
          <h3 className="text-[#ff0000] font-display font-bold text-xl">VISUALIZER CRASHED</h3>
          <p className="text-textMuted text-sm max-w-md font-mono">
            The AI generated a trace that doesn't match the expected schema for this visualizer type.
          </p>
          <div className="bg-[#0a0000] p-4 rounded border border-borderDark text-left w-full overflow-auto max-h-32">
            <pre className="text-[10px] text-[#ff4444] font-mono">{this.state.error?.toString()}</pre>
          </div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })} 
            className="px-4 py-2 mt-2 border border-[#00f0ff] text-[#00f0ff] font-mono text-xs hover:bg-[#00f0ff]/10 transition-colors"
          >
            TRY RECOVERING
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
