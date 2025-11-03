import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './rotas/layout'

// lazy load pages (code splitting)
const Home = lazy(() => import('./pages/Inicial/home'))
const Doacoes = lazy(() => import('./pages/doacoes/doacoes'))
const Ranking = lazy(() => import('./pages/ranking/ranking'))
const Badgers = lazy(() => import('./pages/badgers/badger'))
const Sobre = lazy(() => import('./pages/sobre/sobre'))
const Contato = lazy(() => import('./pages/contato/contato'))
const NotFound = lazy(() => import('./pages/naoEncontrado/notFound'))

export default function App() {
  return (
    <Suspense fallback={<div style={{padding:20}}>Carregando...</div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="doacoes" element={<Doacoes />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="badgers" element={<Badgers />} />
          <Route path="sobre" element={<Sobre />} />
          <Route path="contato" element={<Contato />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}