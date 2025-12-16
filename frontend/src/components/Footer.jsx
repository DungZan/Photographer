const Footer = ({ name }) => (
  <footer className="footer">
    <p>© {new Date().getFullYear()} {name}. Ghi lại câu chuyện của bạn bằng ánh sáng.</p>
  </footer>
);

export default Footer;
