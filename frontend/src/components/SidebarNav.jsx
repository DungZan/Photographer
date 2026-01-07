import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { id: 'hero', label: 'Home', icon: 'bi-house' },
  { id: 'about', label: 'About', icon: 'bi-person' },
  { id: 'stats', label: 'Stats', icon: 'bi-graph-up' },
  { id: 'skills', label: 'Skills', icon: 'bi-lightning-charge' },
  { id: 'resume', label: 'Resume', icon: 'bi-file-earmark-text' },
  { id: 'portfolio', label: 'Portfolio', icon: 'bi-images' },
  { id: 'services', label: 'Services', icon: 'bi-hdd-stack' },
  { id: 'contact', label: 'Contact', icon: 'bi-envelope' },
  { id: 'date', label: 'Date', icon: 'bi-calendar' },
];

const SidebarNav = ({ name }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="nav-toggle"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        aria-controls="site-sidebar"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <i className={`bi ${isOpen ? 'bi-x' : 'bi-list'}`}></i>
      </button>
      <div
        className={clsx('sidebar-backdrop', { 'sidebar-backdrop--open': isOpen })}
        onClick={handleLinkClick}
        aria-hidden="true"
      />
      <aside id="site-sidebar" className={clsx('sidebar', { 'sidebar--open': isOpen })}>
        <div className="sidebar__brand">
          <p className="sidebar__kicker">Portfolio</p>
          <h1>{name}</h1>
        </div>
        <nav>
          {navLinks.map((link) => (
            <a key={link.id} href={`#${link.id}`} onClick={handleLinkClick}>
              <i className={`bi ${link.icon}`}></i>
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
        <ThemeToggle />
        <Link to="/admin" className="sidebar__admin" onClick={handleLinkClick}>
          <i className="bi bi-shield-lock"></i>
          <span>Admin</span>
        </Link>
      </aside>
    </>
  );
};

export default SidebarNav;
