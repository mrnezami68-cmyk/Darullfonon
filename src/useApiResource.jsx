import { useCallback, useEffect, useState } from 'react'

export function useApiResource(loader, dependencies = []) {
  const load = useCallback(loader, dependencies)
  const [state, setState] = useState({ data: null, loading: true, error: null })

  function reload() {
    setState((current) => ({ ...current, loading: true, error: null }))
    return load()
      .then((data) => { setState({ data, loading: false, error: null }); return data })
      .catch((error) => { setState({ data: null, loading: false, error }); return null })
  }

  useEffect(() => {
    let alive = true
    setState({ data: null, loading: true, error: null })
    load()
      .then((data) => { if (alive) setState({ data, loading: false, error: null }) })
      .catch((error) => { if (alive) setState({ data: null, loading: false, error }) })
    return () => { alive = false }
  }, [load])

  return { ...state, reload }
}

export function ApiState({ loading, error, onRetry, children }) {
  if (loading) return <div className="api-state api-loading" role="status"><span className="loading-spinner" /><strong>در حال آماده‌سازی مسیر...</strong><span>یک لحظه با ما بمان.</span></div>
  if (error) return <div className="api-state api-error" role="alert"><span className="api-state-icon">!</span><strong>ارتباط با دارالفنون برقرار نشد.</strong><span>{error.message || 'لطفاً دوباره تلاش کن.'}</span><button className="outline-button" type="button" onClick={onRetry}>تلاش دوباره</button></div>
  return children
}
