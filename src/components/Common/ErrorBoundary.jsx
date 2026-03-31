import { Component } from 'react'
import './ErrorBoundary.css'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Something Went Wrong</h2>
            <p className="error-message">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details (Development Only)</summary>
                <pre>
                  {this.state.error && this.state.error.toString()}
                  {'\n'}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <button
              className="error-button"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
