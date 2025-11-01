import type { JSX } from 'react'
import './header.css'
import AppNavbar from './navbar'

export default function Header(): JSX.Element {
  return (
    <header className="eco-header">
      <div className="eco-header-inner">
        <AppNavbar />
      </div>
    </header>
  )
}