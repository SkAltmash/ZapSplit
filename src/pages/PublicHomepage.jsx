import React from 'react'

import Hero from '../components/Hero'
import AboutSection from '../components/AboutSection'
import FeaturesSection from '../components/FeaturesSection'
import FAQSection from '../components/FAQSection'
import TestimonialsSection from '../components/TestimonialsSection'
import Footer from '../components/Footer'
function PublicHomepage() {
  return (
      <>
    <Hero />
    <AboutSection />
    <FeaturesSection />
    <TestimonialsSection />
        <FAQSection />

    <Footer />
    </>
  
  )
}

export default PublicHomepage