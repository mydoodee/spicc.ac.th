import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Personnel from "./components/Personnel";
import Courses from "./components/Courses";
import News from "./components/News";
import About from "./components/About";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import ProcurementAnnouncements from "./components/ProcurementAnnouncements";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f8f5]">
      <LandingPage />
      <Navbar />
      <Hero />
      <News />
      <Personnel />
      <Courses />
      <ProcurementAnnouncements />
      <About />
      <Footer />
    </main>
  );
}
