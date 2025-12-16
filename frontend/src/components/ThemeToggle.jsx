import clsx from 'clsx';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '', variant = 'sidebar' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const icon = isDark ? 'bi-brightness-high' : 'bi-moon';
  const label = isDark ? 'Chế độ sáng' : 'Chế độ tối';

  return (
    <button
      type="button"
      className={clsx('theme-toggle', `theme-toggle--${variant}`, className)}
      onClick={toggleTheme}
      aria-label="Toggle color theme"
    >
      <i className={`bi ${icon}`}></i>
      <span>{label}</span>
    </button>
  );
};

export default ThemeToggle;
