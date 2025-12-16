import SectionTitle from './SectionTitle';

const accentPalette = {
  cyan: '#54b0ff',
  orange: '#ff6f3c',
};

const Services = ({ services }) => {
  if (!services?.length) return null;

  return (
    <section id="services" className="section services">
      <SectionTitle kicker="Dịch vụ" title="Bạn có thể mong đợi" subtitle="Một vài dịch vụ mình đang mở" />
      <div className="services__grid">
        {services.map((service, index) => (
          <article
            key={service.title}
            className="service-card"
            style={{ borderColor: `${accentPalette[service.accent] || 'var(--line)'}` }}
            data-aos="flip-up"
            data-aos-delay={index * 100}
          >
            <div
              className="service-card__icon"
              style={{ color: accentPalette[service.accent] || 'var(--accent)' }}
            >
              <i className={`bi ${service.icon}`}></i>
            </div>
            <h5>{service.title}</h5>
            <p>{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Services;
