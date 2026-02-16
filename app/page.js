import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HomeSlider from "./components/HomeSlider";
import Features from "./components/Features";
import Personnel from "./components/Personnel";
import Courses from "./components/Courses";
import News from "./components/News";
import About from "./components/About";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import ProcurementAnnouncements from "./components/ProcurementAnnouncements";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getSiteSettings() {
  try {
    const settings = await query('SELECT * FROM cms_site_settings LIMIT 1');
    return settings[0] || {};
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return {};
  }
}

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen bg-[#f8f8f5]">
      <LandingPage />
      <Navbar />

      <div className="relative">
        <Hero />
        {settings.show_home_slider !== 0 && <HomeSlider />}
      </div>

      {settings.show_news !== 0 && <News />}
      {settings.show_personnel !== 0 && <Personnel />}
      {settings.show_courses !== 0 && <Courses />}

      {settings.show_procurement !== 0 && <ProcurementAnnouncements />}

      {settings.show_features !== 0 && <Features />}
      {settings.show_about !== 0 && <About />}

      <Footer />
    </main>
  );
}
