import Hero from "@/components/sections/Hero";
import GeometricStory from "@/components/sections/GeometricStory";
import Manifesto from "@/components/sections/Manifesto";
import WorkIntro from "@/components/sections/WorkIntro";
import HorizontalProjects from "@/components/sections/HorizontalProjects";
import Skills from "@/components/sections/Skills";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <GeometricStory />
      <Manifesto />
      <WorkIntro />
      <HorizontalProjects />
      <Skills />
      <About />
      <Experience />
      <Contact />
    </main>
  );
}
