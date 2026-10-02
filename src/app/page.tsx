import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Metrics } from "@/components/sections/Metrics";
import { Toolbelt } from "@/components/sections/Toolbelt";
import { Work } from "@/components/sections/Work";

// Every section is server-rendered HTML: the page is complete and readable
// before (or without) the 3D backdrop. Each section's data-stage picks the
// particle formation shown while it is centered in the viewport.
export default function Home() {
  return (
    <>
      <Backdrop />
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <Work />
        <Metrics />
        <Toolbelt />
        <Experience />
        <Contact />
      </main>
    </>
  );
}
