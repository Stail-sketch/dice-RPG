import React from 'react';
import { useGameStore } from '../../stores/gameStore';

interface State {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false, error: null, showDetails: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReturn = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
    useGameStore.getState().setScreen('town');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{ padding: 24 }}>
        <div className="rpg-panel" style={{ textAlign: 'center' }}>
          <div className="rpg-panel-title">エラーが発生しました</div>
          <p style={{ margin: '12px 0', color: 'var(--text-secondary)' }}>
            予期しないエラーが発生しました。
          </p>

          <button className="rpg-btn rpg-btn-primary" onClick={this.handleReturn}>
            街に戻る
          </button>

          <button
            className="rpg-btn"
            style={{ fontSize: 12, marginTop: 8 }}
            onClick={() =>
              this.setState((s) => ({ showDetails: !s.showDetails }))
            }
          >
            {this.state.showDetails ? '詳細を閉じる' : '詳細を表示'}
          </button>

          {this.state.showDetails && this.state.error && (
            <div
              className="rpg-panel"
              style={{
                marginTop: 8,
                textAlign: 'left',
                fontSize: 11,
                maxHeight: 200,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                color: 'var(--text-secondary)',
              }}
            >
              <strong>{this.state.error.name}:</strong> {this.state.error.message}
              {this.state.error.stack && (
                <>
                  {'\n\n'}
                  {this.state.error.stack}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
