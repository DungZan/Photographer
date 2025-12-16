import { useEffect } from 'react';
import AOS from 'aos';
import { useSiteContent } from '../hooks/useSiteContent';
import SidebarNav from '../components/SidebarNav';
import Hero from '../components/Hero';
import About from '../components/About';
import Stats from '../components/Stats';
import Skills from '../components/Skills';
import Resume from '../components/Resume';
import Portfolio from '../components/Portfolio';
import Services from '../components/Services';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import ScrollTop from '../components/ScrollTop';

const HomePage = () => {
  const { data, status } = useSiteContent();

  useEffect(() => {
    AOS.init({
      duration: 720,
      once: true,
      easing: 'ease-out-cubic',
      offset: 80,
    });
    AOS.refresh();
  }, [status]);

  if (status === 'loading') {
    return <div className="app-state">Đang tải nội dung...</div>;
  }

  if (status === 'error' || !data) {
    return <div className="app-state app-state--error">Không thể tải dữ liệu, vui lòng thử lại sau.</div>;
  }

  return (
    <div className="app-shell">
      <SidebarNav name={data.hero.name} />
      <main className="app-main">
        <Hero hero={data.hero} />
        <About about={data.about} />
        <Stats stats={data.stats} />
        <Skills skills={data.skills} />
        <Resume resume={data.resume} />
        <Portfolio portfolio={data.portfolio} />
        <Services services={data.services} />
        <Contact contact={data.contact} />
        <Footer name={data.hero.name} />
      </main>
      <ScrollTop />
    </div>
  );
};

export default HomePage;
