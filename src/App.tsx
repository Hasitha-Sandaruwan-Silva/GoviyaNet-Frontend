import { BrowserRouter } from 'react-router-dom'
import { AppProviders } from '@/providers/AppProviders'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { AppRoutes } from '@/router'

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App
