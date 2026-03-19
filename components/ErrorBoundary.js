class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showFeedback: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to analytics or error tracking service
    try {
      // You could send to Sentry, LogRocket, etc.
      console.log('Error logged:', {
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  handleReportError = () => {
    this.setState({ showFeedback: true });
  };

  handleCloseFeedback = () => {
    this.setState({ showFeedback: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const errorStack = this.state.error?.stack || this.state.error?.toString() || 'Unknown error';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="icon-alert-triangle text-3xl text-red-600"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                We're sorry for the inconvenience. The application encountered an unexpected error.
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <details className="text-sm">
                <summary className="font-medium text-red-800 cursor-pointer hover:text-red-900">
                  Error Details
                </summary>
                <div className="mt-3 space-y-2">
                  <div>
                    <strong className="text-red-800">Error:</strong>
                    <p className="text-red-700 mt-1">{this.state.error?.toString()}</p>
                  </div>
                  {this.state.error?.stack && (
                    <div>
                      <strong className="text-red-800">Stack Trace:</strong>
                      <pre className="text-xs text-red-700 mt-1 overflow-x-auto p-2 bg-white rounded border border-red-100">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleReportError}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium flex items-center justify-center space-x-2"
              >
                <span>🐛</span>
                <span>Report This Error</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={this.handleReload}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
                >
                  Go to Home
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>If this problem persists, please contact support at</p>
              <a href="mailto:support@foodmaps.org" className="text-green-600 hover:text-green-700">
                support@foodmaps.org
              </a>
            </div>
          </div>

          {this.state.showFeedback && (
            <FeedbackModal
              onClose={this.handleCloseFeedback}
              initialData={{
                type: 'error_report',
                subject: `Application Error: ${this.state.error?.message || 'Unknown error'}`,
                message: `An unexpected error occurred while using the application.\n\nPlease describe what you were doing when this happened:`,
                errorStack: errorStack
              }}
            />
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
