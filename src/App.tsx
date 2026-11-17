import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Attention from './pages/Attention'
import Directory from './pages/Directory'
import OrgDetail from './pages/OrgDetail'
import UserDetail from './pages/UserDetail'
import Plans from './pages/Plans'
import Audit from './pages/Audit'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/attention" element={<Attention />} />
        <Route path="/users" element={<Directory key="users" kind="users" />} />
        <Route path="/users/:id" element={<UserDetail />} />
        {(['bd', 'np', 'up'] as const).map(k => (
          <Route key={k} path={`/${k}`} element={<Directory key={k} kind={k} />} />
        ))}
        {(['bd', 'np', 'up'] as const).map(k => (
          <Route key={k + 'd'} path={`/${k}/:id`} element={<OrgDetail key={k} kind={k} />} />
        ))}
        <Route path="/plans" element={<Plans />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
