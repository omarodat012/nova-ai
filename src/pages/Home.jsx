import About from '../components/home/About.jsx';
import Achievements from '../components/home/Achievements.jsx';
import Contact from '../components/home/Contact.jsx';
import Hero from '../components/home/Hero.jsx';
import SubTeams from '../components/home/SubTeams.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <SubTeams />
      <Achievements />
      <Contact />
    </>
  );
}
