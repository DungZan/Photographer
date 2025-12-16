import { useMemo } from 'react';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const formatKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeSlots = (slots) => {
  const map = new Map();
  (slots ?? []).forEach((slot) => {
    if (!slot?.date) return;
    const key = slot.date.slice(0, 10);
    map.set(key, {
      status: slot.status ?? 'available',
      note: slot.note ?? '',
    });
  });
  return map;
};

const buildCalendar = (slots, months) => {
  const slotMap = normalizeSlots(slots);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const result = [];

  for (let monthOffset = 0; monthOffset < months; monthOffset += 1) {
    const current = new Date(start.getFullYear(), start.getMonth() + monthOffset, 1);
    const days = [];
    const startWeekday = (current.getDay() + 6) % 7; // shift to Monday-first
    const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();

    for (let i = 0; i < startWeekday; i += 1) {
      days.push({ key: `empty-${monthOffset}-${i}`, empty: true });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(current.getFullYear(), current.getMonth(), day);
      const key = formatKey(date);
      const slot = slotMap.get(key);
      days.push({
        key,
        empty: false,
        label: day,
        date,
        status: slot?.status ?? null,
        note: slot?.note ?? '',
        isToday: formatKey(date) === formatKey(today),
      });
    }

    result.push({
      key: `${current.getFullYear()}-${current.getMonth()}`,
      label: current.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
      days,
    });
  }

  return result;
};

const AvailabilityCalendar = ({ slots, months = 2, className = '', legend = true }) => {
  const calendar = useMemo(() => buildCalendar(slots, months), [slots, months]);

  return (
    <div className={`calendar-book ${className}`}>
      {legend && (
        <div className="calendar-book__legend">
          <span className="calendar-book__legend-item">
            <span className="calendar-book__dot calendar-book__dot--available"></span>
            Còn trống
          </span>
          <span className="calendar-book__legend-item">
            <span className="calendar-book__dot calendar-book__dot--booked"></span>
            Đã có khách
          </span>
        </div>
      )}
      <div className="calendar-book__months">
        {calendar.map((month) => (
          <article key={month.key} className="calendar-book__month">
            <header>
              <h6>{month.label}</h6>
              <div className="calendar-book__weekdays">
                {DAY_LABELS.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </header>
            <div className="calendar-book__grid">
              {month.days.map((day) => {
                if (day.empty) {
                  return <span key={day.key} className="calendar-book__day calendar-book__day--empty" aria-hidden="true"></span>;
                }

                const statusClass = day.status ? `calendar-book__day--${day.status}` : '';

                return (
                  <div
                    key={day.key}
                    className={`calendar-book__day ${statusClass} ${day.isToday ? 'calendar-book__day--today' : ''}`}
                    title={day.note || undefined}
                  >
                    <span className="calendar-book__date">{day.label}</span>
                    {day.note && <span className="calendar-book__note">{day.note}</span>}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
