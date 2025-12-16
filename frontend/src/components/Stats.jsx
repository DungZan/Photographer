import CountUp from 'react-countup';
import SectionTitle from './SectionTitle';

const Stats = ({ stats }) => {
  if (!stats?.length) return null;

  return (
    <section id="stats" className="section stats">
      <SectionTitle kicker="Thành tựu" title="Các con số" subtitle="Một vài mốc nổi bật trong hành trình chụp ảnh" />
      <div className="stats__grid">
        {stats.map((stat, index) => (
          <article key={stat.label} className="stat-card" data-aos="zoom-in" data-aos-delay={index * 80}>
            <div className="stat-card__icon">
              <i className={`bi ${stat.icon}`}></i>
            </div>
            <p className="stat-card__value">
              <CountUp end={stat.value} duration={1.4} />
              {stat.suffix ?? ''}
            </p>
            <p className="stat-card__label">{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Stats;
