import { useEffect, useState } from 'react';
import SectionTitle from './SectionTitle';
import AvailabilityCalendar from './AvailabilityCalendar';
import client from '../api/client';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  shootDate: '',
  subject: '',
  message: '',
};

const Contact = ({ contact }) => {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [feedback, setFeedback] = useState('');
  const [availability, setAvailability] = useState([]);
  const [availabilityStatus, setAvailabilityStatus] = useState('loading');

  if (!contact) return null;

  useEffect(() => {
    setAvailabilityStatus('loading');
    client
      .get('/api/availability')
      .then((response) => {
        setAvailability(response.data ?? []);
        setAvailabilityStatus('success');
      })
      .catch(() => setAvailabilityStatus('error'));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('loading');
    setFeedback('');

    client
      .post('/api/contact', form)
      .then((response) => {
        setStatus('success');
        setFeedback(response.data.message);
        setForm(initialForm);
      })
      .catch(() => {
        setStatus('error');
        setFeedback('Có lỗi xảy ra, bạn vui lòng thử lại.');
      });
  };

  return (
    <section id="contact" className="section contact">
      <SectionTitle kicker="Liên hệ" title="Kết nối" subtitle={contact.intro} />
      <div className="contact__layout">
        <div className="contact__info" data-aos="fade-right" data-aos-delay="120">
          {contact.items.map((item) => (
            <article key={item.label}>
              <div className="contact__icon">
                <i className={`bi ${item.icon}`}></i>
              </div>
              <div>
                <h5>{item.label}</h5>
                <p>{item.value}</p>
              </div>
            </article>
          ))}
        </div>
        <form className="contact__form" onSubmit={handleSubmit} data-aos="fade-left" data-aos-delay="180">
          <div className="contact__form-grid">
            <label>
              <span>Họ tên</span>
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              <span>Số điện thoại</span>
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} required />
            </label>
          </div>
          <label>
            <span>Ngày chụp</span>
            <input name="shootDate" type="date" value={form.shootDate} onChange={handleChange} required />
          </label>
          <label>
            <span>Chủ đề</span>
            <input name="subject" value={form.subject} onChange={handleChange} required />
          </label>
          <label>
            <span>Nội dung</span>
            <textarea name="message" rows="5" value={form.message} onChange={handleChange} required></textarea>
          </label>
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </button>
          {feedback && (
            <p
              className={`contact__feedback ${
                status === 'success'
                  ? 'contact__feedback--success'
                  : status === 'error'
                    ? 'contact__feedback--error'
                    : ''
              }`}
            >
              {feedback}
            </p>
          )}
        </form>
      </div>
      <section className="availability-panel" data-aos="fade-up" data-aos-delay="200">
        <header>
          <div className="availability-panel__icon">
            <i className="bi bi-calendar-heart"></i>
          </div>
          <div>
            <p className="availability-panel__eyebrow">Lịch chụp</p>
            <h3>Ngày trống và ngày đã kín</h3>
            <p>Chọn ngày phù hợp nhất hoặc gửi tin nhắn để được ưu tiên giữ chỗ.</p>
          </div>
        </header>
        <div className="availability-panel__body">
          {availabilityStatus === 'loading' && <p>Đang đồng bộ lịch...</p>}
          {availabilityStatus === 'error' && <p className="availability-panel__error">Không thể tải lịch, vui lòng gửi yêu cầu trực tiếp.</p>}
          {availabilityStatus === 'success' && (
            <AvailabilityCalendar slots={availability} months={3} />
          )}
          {availabilityStatus === 'success' && availability.length === 0 && (
            <p className="availability-panel__empty">Hiện chưa có ngày nào mở công khai. Hãy gửi yêu cầu để được giữ lịch riêng.</p>
          )}
        </div>
      </section>
    </section>
  );
};

export default Contact;
