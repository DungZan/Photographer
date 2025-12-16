import SectionTitle from './SectionTitle';

const Skills = ({ skills }) => {
  if (!skills?.length) return null;

  return (
    <section id="skills" className="section skills">
      <SectionTitle kicker="Kỹ năng" title="Bộ công cụ" subtitle="Một vài kỹ năng giúp mình kể chuyện bằng ánh sáng" />
      <div className="skills__grid" data-aos="fade-up" data-aos-delay="120">
        {skills.map((skill) => (
          <div key={skill.name} className="skill-bar">
            <div className="skill-bar__head">
              <p>{skill.name}</p>
              <span>{skill.value}%</span>
            </div>
            <div className="skill-bar__track">
              <div className="skill-bar__value" style={{ width: `${skill.value}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Skills;
