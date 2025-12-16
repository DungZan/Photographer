import SectionTitle from './SectionTitle';

const Resume = ({ resume }) => {
  if (!resume) return null;

  return (
    <section id="resume" className="section resume">
      <SectionTitle kicker="Tóm tắt" title="Bảng giá & quy trình" subtitle={resume.intro} />
      <div className="resume__layout">
        <article className="resume-profile" data-aos="fade-right" data-aos-delay="80">
          <div>
            <p className="resume-profile__eyebrow">Giới thiệu</p>
            <h3>{resume.summary.name}</h3>
            <p className="resume__role">{resume.summary.role}</p>
            <p className="resume-profile__description">{resume.summary.description}</p>
          </div>
          <div className="resume-profile__tags">
            {resume.summary.details.map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>
          <a href="#contact" className="resume-profile__cta">
            Đặt lịch ngay
            <i className="bi bi-arrow-up-right"></i>
          </a>
        </article>
        <div className="resume-panels" data-aos="fade-left" data-aos-delay="150">
          <section className="resume-panel resume-panel--pricing">
            <div className="resume-panel__head">
              <h4>Bảng giá</h4>
              <p>Chọn gói phù hợp với buổi chụp của bạn.</p>
            </div>
            <div className="resume-tier-grid">
              {resume.pricing.map((plan) => (
                <article key={plan.title} className="resume-tier">
                  <div className="resume-tier__meta">
                    <span>{plan.duration}</span>
                    <span className="resume-tier__price">{plan.price}</span>
                  </div>
                  <h5>{plan.title}</h5>
                  <p className="resume-tier__description">{plan.description}</p>
                  <p className="resume-tier__details">{plan.details}</p>
                  <button type="button" className="resume-tier__cta">
                    Đặt gói này
                  </button>
                </article>
              ))}
            </div>
          </section>
          <section className="resume-panel resume-panel--process">
            <div className="resume-panel__head">
              <h4>Quy trình</h4>
              <p>Các bước từ trao đổi ý tưởng đến bàn giao ảnh.</p>
            </div>
            <ol className="resume-process">
              {resume.process.map((item, index) => (
                <li key={item.title} className="resume-process__item">
                  <div className="resume-process__index">{String(index + 1).padStart(2, '0')}</div>
                  <div className="resume-process__content">
                    <p className="resume-process__meta">
                      {item.location} · {item.duration}
                    </p>
                    <h5>{item.title}</h5>
                    <ul>
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </section>
  );
};

export default Resume;
