import Link from 'next/link'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="font-heading text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent leading-tight">
            Spartan Design
          </h1>
          <p className="font-heading text-2xl md:text-3xl mb-6 text-accent-400 font-semibold">
            Professional Laser Cutting Design Platform
          </p>
          <p className="text-lg md:text-xl mb-12 text-neutral-300 max-w-3xl mx-auto leading-relaxed">
            Design custom laser cut products with our intuitive 3D designer.
            Perfect for gates, decorative panels, signage, and custom metalwork.
            Get instant quotes and submit your designs directly to our engineers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/designer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Designing
            </Link>
            <a
              href="#how-it-works"
              className="inline-block px-8 py-4 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg text-lg transition-all border border-neutral-600"
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 hover:border-accent-500 transition-all hover:shadow-lg hover:shadow-accent-500/20">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold mb-3 text-white">3D Designer</h3>
            <p className="text-neutral-400 leading-relaxed">
              Visualize your designs in real-time with our interactive 3D canvas. Drag, resize, and customize shapes with ease.
            </p>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 hover:border-accent-500 transition-all hover:shadow-lg hover:shadow-accent-500/20">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold mb-3 text-white">Material Selection</h3>
            <p className="text-neutral-400 leading-relaxed">
              Choose from mild steel, stainless steel, and aluminum in various thicknesses for your project.
            </p>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm p-8 rounded-xl border border-neutral-700 hover:border-accent-500 transition-all hover:shadow-lg hover:shadow-accent-500/20">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold mb-3 text-white">Export & Submit</h3>
            <p className="text-neutral-400 leading-relaxed">
              Export production-ready SVG files or submit directly to our engineers for a detailed quote.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="py-20 bg-neutral-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-white">
              Example Projects
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              See what you can create with our laser cutting design platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Example 1 - Decorative Gate */}
            <div className="group relative overflow-hidden rounded-xl bg-neutral-800 border border-neutral-700 hover:border-accent-500 transition-all">
              <div className="aspect-square bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center p-8">
                <svg viewBox="0 0 200 200" className="w-full h-full text-accent-400">
                  <rect x="10" y="10" width="180" height="180" fill="none" stroke="currentColor" strokeWidth="4" />
                  <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path d="M 60 60 L 140 140 M 140 60 L 60 140" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold mb-2 text-white">Decorative Gate Panel</h3>
                <p className="text-sm text-neutral-400">Stainless steel, 3mm thick</p>
              </div>
            </div>

            {/* Example 2 - Custom Signage */}
            <div className="group relative overflow-hidden rounded-xl bg-neutral-800 border border-neutral-700 hover:border-accent-500 transition-all">
              <div className="aspect-square bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center p-8">
                <svg viewBox="0 0 200 200" className="w-full h-full text-primary-400">
                  <rect x="20" y="60" width="160" height="80" rx="10" fill="none" stroke="currentColor" strokeWidth="4" />
                  <text x="100" y="110" textAnchor="middle" className="font-bold text-3xl" fill="currentColor">LOGO</text>
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold mb-2 text-white">Custom Business Sign</h3>
                <p className="text-sm text-neutral-400">Aluminum, 2mm thick</p>
              </div>
            </div>

            {/* Example 3 - Decorative Panel */}
            <div className="group relative overflow-hidden rounded-xl bg-neutral-800 border border-neutral-700 hover:border-accent-500 transition-all">
              <div className="aspect-square bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center p-8">
                <svg viewBox="0 0 200 200" className="w-full h-full text-secondary-400">
                  <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M 100 30 L 120 90 L 180 90 L 130 130 L 150 190 L 100 150 L 50 190 L 70 130 L 20 90 L 80 90 Z" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold mb-2 text-white">Star Pattern Panel</h3>
                <p className="text-sm text-neutral-400">Mild steel, 4mm thick</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/designer"
              className="inline-block px-8 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-lg transition-all border border-neutral-600"
            >
              Create Your Own Design
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-neutral-800/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-white">
              How It Works
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              From design to production in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-accent-500/30">
                  <span className="font-heading text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="font-heading text-2xl font-bold mb-3 text-white">Design</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Use our intuitive 3D designer to create your custom design. Choose shapes, add holes, and specify dimensions with precision.
                </p>
              </div>
              {/* Connector Arrow */}
              <div className="hidden md:block absolute top-10 -right-6 text-accent-500/30">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary-500/30">
                  <span className="font-heading text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="font-heading text-2xl font-bold mb-3 text-white">Customize</h3>
                <p className="text-neutral-400 leading-relaxed">
                  Select your material type and thickness. Choose from mild steel, stainless steel, or aluminum to match your project needs.
                </p>
              </div>
              {/* Connector Arrow */}
              <div className="hidden md:block absolute top-10 -right-6 text-primary-500/30">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-secondary-500/30">
                <span className="font-heading text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="font-heading text-2xl font-bold mb-3 text-white">Submit</h3>
              <p className="text-neutral-400 leading-relaxed">
                Export your design as SVG or submit directly to our engineers. We'll review your project and provide a detailed quote.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/designer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-lg text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4 text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-neutral-400">
              Everything you need to know about our laser cutting services
            </p>
          </div>

          <div className="space-y-6">
            {/* FAQ Item 1 */}
            <details className="group bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden">
              <summary className="cursor-pointer p-6 font-heading font-semibold text-lg text-white hover:text-accent-400 transition flex justify-between items-center">
                What materials do you work with?
                <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-neutral-400">
                We work with mild steel, stainless steel, and aluminum in various thicknesses ranging from 1mm to 6mm. Each material can be selected in the designer interface based on your project requirements.
              </div>
            </details>

            {/* FAQ Item 2 */}
            <details className="group bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden">
              <summary className="cursor-pointer p-6 font-heading font-semibold text-lg text-white hover:text-accent-400 transition flex justify-between items-center">
                How does the quoting process work?
                <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-neutral-400">
                After designing your project, you can submit it directly through our platform. Our engineers will review your design and provide a detailed quote based on material costs, cutting complexity, and project size. You'll receive a quote within 24-48 hours.
              </div>
            </details>

            {/* FAQ Item 3 */}
            <details className="group bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden">
              <summary className="cursor-pointer p-6 font-heading font-semibold text-lg text-white hover:text-accent-400 transition flex justify-between items-center">
                Can I export my design without submitting?
                <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-neutral-400">
                Yes! You can export your designs as production-ready SVG files at any time. These files are compatible with Fusion 360 and other CAD software, allowing you to use them however you need.
              </div>
            </details>

            {/* FAQ Item 4 */}
            <details className="group bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden">
              <summary className="cursor-pointer p-6 font-heading font-semibold text-lg text-white hover:text-accent-400 transition flex justify-between items-center">
                What types of projects can I create?
                <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-neutral-400">
                Our platform is perfect for gates, decorative panels, signage, brackets, custom metalwork, architectural details, and any flat laser-cut designs. The 3D designer supports various shapes including rectangles, circles, polygons, and custom text.
              </div>
            </details>

            {/* FAQ Item 5 */}
            <details className="group bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden">
              <summary className="cursor-pointer p-6 font-heading font-semibold text-lg text-white hover:text-accent-400 transition flex justify-between items-center">
                How do I add holes to my design?
                <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-neutral-400">
                Select any shape in the designer, and you'll see hole creation tools in the left sidebar. You can add circular or rectangular holes, specify their dimensions and positions, and edit them anytime before exporting or submitting.
              </div>
            </details>

            {/* FAQ Item 6 */}
            <details className="group bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700 overflow-hidden">
              <summary className="cursor-pointer p-6 font-heading font-semibold text-lg text-white hover:text-accent-400 transition flex justify-between items-center">
                What's the turnaround time for projects?
                <svg className="w-5 h-5 transform group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-6 text-neutral-400">
                Turnaround time varies based on project complexity and current workload. Typical projects are completed within 5-10 business days after quote approval. Rush orders may be available - contact us for details.
              </div>
            </details>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
