import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="hero-title-accent">Talk</span>About
        </h1>
        <p className="hero-subtitle">
          Обсуждайте фильмы, делитесь впечатлениями и находите новых друзей
        </p>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-value">10K+</span>
            <span className="stat-label">фильмов</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">50K+</span>
            <span className="stat-label">пользователей</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-value">100K+</span>
            <span className="stat-label">отзывов</span>
          </div>
        </div>
      </div>
      <div className="hero-scroll-hint">
        <span className="scroll-arrow">↓</span>
        <span className="scroll-text">Лучшие фильмы ждут вас</span>
      </div>
    </section>
  )
}

export default Hero