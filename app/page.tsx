import Footer from "@/components/Footer";
import Home from "@/components/Home";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <div>
      <Navbar />

      <main>
        <Home />
      </main>

      <Footer />
    </div>
  );
}
