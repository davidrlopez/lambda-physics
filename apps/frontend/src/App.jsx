import { useState } from "react"
import "./App.css"
import FallingText from "./FallingText"

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo" mark>Arquímedes</h1>

        <button
          className="hamburger"
          aria-label="Abrir menú"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <ul>
            <li><a href="#hero" onClick={closeMenu}>Inicio</a></li>
            <li><a href="#biografia" onClick={closeMenu}>Biografía</a></li>
            <li><a href="#aportaciones" onClick={closeMenu}>Aportaciones</a></li>
            <li><a href="#inventos" onClick={closeMenu}>Inventos</a></li>
            <li><a href="#legado" onClick={closeMenu}>Legado</a></li>
            <li><a href="#curiosidades" onClick={closeMenu}>Curiosidades</a></li>
          </ul>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section id="hero" className="hero">
          <div className="hero-bg" />

          <div className="hero-content">
            <div className="hero-title">
              <FallingText
                text="Arquímedes"
                trigger="click"
                backgroundColor="transparent"
                fontSize="clamp(3rem, 10vw, 6rem)"
                fontFamily="greekFont"
                gravity={0.8}
              />
            </div>

            <p className="hero-subtitle">
            </p>
          </div>
        </section>

        <section id="biografia" className="section">
          <h2>Biografía</h2>
          <div className="content">
            <p>
              Arquímedes de Siracusa (c. 287 a.C. – 212 a.C.) fue uno de los mayores
              genios científicos de la Antigüedad.
            </p>
          </div>
        </section>

        <section id="aportaciones" className="section alt">
          <h2>Aportaciones</h2>
          <div className="cards">
            <article className="card">
              <h3>Matemáticas</h3>
              <p>Avances en geometría y aproximación de π.</p>
            </article>
            <article className="card">
              <h3>Física</h3>
              <p>Principio de flotación.</p>
            </article>
            <article className="card">
              <h3>Mecánica</h3>
              <p>Estudios sobre palancas y poleas.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 IES José Planes</p>
      </footer>
    </div>
  )
}

export default App
