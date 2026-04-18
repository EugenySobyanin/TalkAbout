import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <p className="hero-kicker">Смотри. Чувствуй. Сохраняй.</p>

        <h1 className="hero-title">
          <span className="hero-title-accent">Frame</span>25
        </h1>

        <p className="hero-subtitle">
          Открывайте сильные фильмы, обсуждайте увиденное и собирайте свою личную коллекцию впечатлений.
        </p>
      </div>
    </section>
  )
}

export default Hero