import { useMemo, useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import SectionTitle from './SectionTitle';

const Portfolio = ({ portfolio }) => {
  const [filter, setFilter] = useState('all');

  const items = useMemo(() => {
    if (!portfolio?.items) return [];
    if (filter === 'all') return portfolio.items;
    return portfolio.items.filter((item) => item.category === filter);
  }, [filter, portfolio]);

  if (!portfolio) return null;

  return (
    <section id="portfolio" className="section portfolio">
      <SectionTitle kicker="Ảnh" title="Khoảnh khắc" subtitle={portfolio.intro} />
      <div className="portfolio__filters">
        {portfolio.filters.map((item) => (
          <button
            key={item.value}
            className={item.value === filter ? 'is-active' : ''}
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <PhotoProvider>
        <div className="portfolio__grid">
          {items.map((item, index) => (
            <PhotoView key={`${item.image}-${index}`} src={item.image}>
              <article className="portfolio-card" data-aos="fade-up" data-aos-delay={index * 50}>
                <div className="portfolio-card__media">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <span className="portfolio-card__badge">{item.badge}</span>
                </div>
                <div className="portfolio-card__body">
                  <h5>{item.title}</h5>
                  <p>{item.description}</p>
                </div>
              </article>
            </PhotoView>
          ))}
        </div>
      </PhotoProvider>
    </section>
  );
};

export default Portfolio;
