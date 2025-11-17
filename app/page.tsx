import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-spartan-stone-900 text-white py-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className="text-2xl font-display font-bold tracking-wider">
            SPARTAN<span className="text-spartan-gold-400">DESIGN</span>
          </h1>
          <ul className="flex gap-8 font-bold text-sm uppercase tracking-wide">
            <li><Link href="#features" className="hover:text-spartan-gold-400 transition-colors">Features</Link></li>
            <li><Link href="#principles" className="hover:text-spartan-gold-400 transition-colors">Principles</Link></li>
            <li><Link href="#components" className="hover:text-spartan-gold-400 transition-colors">Components</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-spartan-hero py-32 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="font-display text-6xl font-black mb-6 animate-fade-in">
            BOLD. DISCIPLINED. TIMELESS.
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto text-spartan-stone-200 animate-slide-up">
            A design system forged in the spirit of ancient Sparta—where every element serves a purpose,
            and excellence is the only standard.
          </p>
          <div className="flex gap-6 justify-center animate-slide-up">
            <button className="spartan-button">
              Get Started
            </button>
            <button className="px-8 py-3 bg-transparent text-white font-bold uppercase tracking-wider rounded-none border-2 border-spartan-gold-400 hover:bg-spartan-gold-400 hover:text-spartan-stone-900 transition-all duration-300">
              View Docs
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="spartan-heading text-5xl text-center mb-16">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="spartan-card">
              <div className="text-spartan-bronze-600 text-4xl mb-4">⚔️</div>
              <h3 className="spartan-heading text-2xl mb-4">Battle-Tested</h3>
              <p className="text-spartan-stone-600">
                Built with modern technologies and best practices. Every component is crafted for
                performance and reliability.
              </p>
            </div>
            <div className="spartan-card">
              <div className="text-spartan-crimson-600 text-4xl mb-4">🛡️</div>
              <h3 className="spartan-heading text-2xl mb-4">Disciplined Design</h3>
              <p className="text-spartan-stone-600">
                A cohesive design language with strict principles. No bloat, no waste—only what matters.
              </p>
            </div>
            <div className="spartan-card">
              <div className="text-spartan-gold-600 text-4xl mb-4">👑</div>
              <h3 className="spartan-heading text-2xl mb-4">Premium Quality</h3>
              <p className="text-spartan-stone-600">
                Attention to every detail. From typography to color palettes, excellence in execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section id="principles" className="py-24 bg-spartan-stone-100">
        <div className="container mx-auto px-6">
          <h2 className="spartan-heading text-5xl text-center mb-16">Design Principles</h2>
          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                title: 'Simplicity',
                desc: 'Remove everything unnecessary. What remains should be essential and powerful.'
              },
              {
                title: 'Strength',
                desc: 'Every element should be robust and purposeful. No fragile, decorative additions.'
              },
              {
                title: 'Discipline',
                desc: 'Consistent patterns and adherence to standards create predictability and trust.'
              },
              {
                title: 'Honor',
                desc: 'Respect the user. Fast performance, accessible design, and honest communication.'
              }
            ].map((principle, idx) => (
              <div key={idx} className="bg-white p-8 border-l-8 border-spartan-crimson-600 shadow-md">
                <h3 className="spartan-heading text-3xl mb-3">{principle.title}</h3>
                <p className="text-spartan-stone-600 text-lg">{principle.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Color Palette Showcase */}
      <section id="components" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="spartan-heading text-5xl text-center mb-16">Spartan Color Palette</h2>

          <div className="space-y-12">
            {/* Bronze */}
            <div>
              <h3 className="spartan-heading text-2xl mb-4">Bronze</h3>
              <div className="grid grid-cols-5 gap-4">
                {[50, 300, 500, 700, 900].map(shade => (
                  <div key={shade} className="text-center">
                    <div className={`bg-spartan-bronze-${shade} h-24 rounded shadow-lg`}></div>
                    <p className="mt-2 text-sm font-mono">bronze-{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Crimson */}
            <div>
              <h3 className="spartan-heading text-2xl mb-4">Crimson</h3>
              <div className="grid grid-cols-5 gap-4">
                {[50, 300, 500, 700, 900].map(shade => (
                  <div key={shade} className="text-center">
                    <div className={`bg-spartan-crimson-${shade} h-24 rounded shadow-lg`}></div>
                    <p className="mt-2 text-sm font-mono">crimson-{shade}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gold */}
            <div>
              <h3 className="spartan-heading text-2xl mb-4">Gold</h3>
              <div className="grid grid-cols-5 gap-4">
                {[50, 300, 500, 700, 900].map(shade => (
                  <div key={shade} className="text-center">
                    <div className={`bg-spartan-gold-${shade} h-24 rounded shadow-lg`}></div>
                    <p className="mt-2 text-sm font-mono">gold-{shade}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Button Examples */}
          <div className="mt-16">
            <h3 className="spartan-heading text-2xl mb-6">Button Components</h3>
            <div className="flex flex-wrap gap-4">
              <button className="spartan-button">Primary Action</button>
              <button className="spartan-button-outline">Secondary Action</button>
              <button className="px-8 py-3 bg-spartan-gold-500 text-spartan-stone-900 font-bold uppercase tracking-wider rounded-none border-2 border-spartan-gold-500 hover:bg-transparent hover:text-spartan-gold-600 transition-all duration-300">
                Gold Variant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-spartan-stone-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <p className="font-display text-2xl mb-4">SPARTANDESIGN</p>
          <p className="text-spartan-stone-400">
            Built with Next.js 14 & Tailwind CSS
          </p>
          <p className="text-spartan-stone-500 mt-4 text-sm">
            &quot;Molon Labe&quot; - Come and Take Them
          </p>
        </div>
      </footer>
    </main>
  )
}
