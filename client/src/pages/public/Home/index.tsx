import {
  Hero,
  WhatGain,
  Presentation,
  WatchDemo,
  Newsletter,
  WhyChooseUs,
  Features,
} from "@/components";
import { Faq } from "@/components/elements/Faq";

const Home = ({ faqData }: any) => {

  return (
    <>
      <Hero />
      <Presentation />
      <WhatGain />
      <WatchDemo />
      <WhyChooseUs />
      <Features />
      <Faq faqData={faqData} />
      <Newsletter />
    </>
  );
};

export default Home;
