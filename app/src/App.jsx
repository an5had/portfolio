import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useSmoothScroll from './hooks/useSmoothScroll.js';
import Cursor from './components/Cursor.jsx';
import Nav from './components/Nav.jsx';
import { Footer } from './components/Sections.jsx';
import HomePage from './pages/HomePage.jsx';
import WorksPage from './pages/WorksPage.jsx';
import CaseStudyPage from './pages/CaseStudyPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ArticlesPage from './pages/ArticlesPage.jsx';
import GalleryPage from './pages/GalleryPage.jsx';
import CertificatePage from './pages/CertificatePage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import NotFound from './pages/NotFound.jsx';

function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  useSmoothScroll();
  return (
    <BrowserRouter>
      <Cursor />
      <Nav />
      <ScrollManager />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/works/:id" element={<CaseStudyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/certificate" element={<CertificatePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
