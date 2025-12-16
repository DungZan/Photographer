import SectionTitle from './SectionTitle';

const About = ({ about }) => {
  if (!about) return null;

  return (
    <section id="about" className="section about">
      <SectionTitle kicker="Giới thiệu" title={about.title} subtitle={about.intro} />
      <div className="about__body" data-aos="fade-up" data-aos-delay="100">
        <div className="about__media">
          <img src={about.profileImage} alt={about.highlight} />
        </div>
        <div className="about__content">
          <p className="about__highlight">{about.highlight}</p>
          {about.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <div className="about__details">
            {about.details.map((detail) => (
              <div key={detail.label}>
                <span>{detail.label}</span>
                <p>{detail.value}</p>
              </div>
            ))}
          </div>
          <p className="about__closing">{about.closing}</p>
        </div>
      </div>
    </section>
  );
};

export default About;
