import './footer.css'
import type { JSX } from 'react'

export default function Footer(): JSX.Element {
  return (
    <footer className="eco-footer">
      <div className="eco-footer-inner">
        <div className="eco-footer-left">
          <strong>EcoDoação</strong> © {new Date().getFullYear()}
          <span className="eco-footer-note"> — Sustentabilidade e comunidade</span>
        </div>
        <nav className="eco-footer-links" aria-label="rodapé">
          <a href="/sobre">Sobre</a>
          <a href="/contato">Contato</a>
          <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
        </nav>
      </div>
    </footer>
  )
}