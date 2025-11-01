import { Outlet } from 'react-router-dom'
import Header from '../components/header'
import Footer from '../components/footer'
import type { JSX } from 'react'

export default function Layout(): JSX.Element {
  return (
    <>
      <Header />
      <main className="container-main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}