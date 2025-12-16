import { ReactTyped } from 'react-typed';

const Hero = ({ hero }) => {
  if (!hero) return null;

  return (
    <section
      id="hero"
      className="section hero"
      style={hero.backgroundImage ? { backgroundImage: `url(${hero.backgroundImage})` } : undefined}
    >
      <div className="hero__content" data-aos="zoom-out">
        <p className="hero__eyebrow">Xin chào, mình là</p>
        <h2>{hero.name}</h2>
        <p className="hero__typed">
          Mình là{' '}
          <ReactTyped
            strings={hero.roles}
            loop
            typeSpeed={85}
            backSpeed={40}
            backDelay={1800}
          />
        </p>
        <p className="hero__headline">{hero.headline}</p>
        <div className="hero__social">
          {hero.socialLinks.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
              <i className={`bi ${link.icon}`}></i>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
