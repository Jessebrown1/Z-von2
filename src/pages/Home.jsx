import Hero from '../sections/Hero';
import ScrollStory from '../sections/ScrollStory';
import EditorialParallax from '../sections/EditorialParallax';
import CollectionShowcase from '../sections/CollectionShowcase';
import CTASection from '../sections/CTASection';

export default function Home() {
  return (
    <>
      <Hero />
      <ScrollStory />
      <EditorialParallax />
      <CollectionShowcase />
      <CTASection />
    </>
  );
}
