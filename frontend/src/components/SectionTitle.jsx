const SectionTitle = ({ kicker, title, subtitle }) => (
  <div className="section-title" data-aos="fade-up">
    {kicker && <p className="section-title__kicker">{kicker}</p>}
    <h2>{title}</h2>
    {subtitle && <p className="section-title__subtitle">{subtitle}</p>}
  </div>
);

export default SectionTitle;
