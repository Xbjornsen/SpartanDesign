import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 text-neutral-400">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-heading text-xl font-bold text-white mb-4">Spartan Design</h3>
            <p className="text-sm leading-relaxed mb-4">
              Professional laser cutting design platform for custom metalwork, gates, signage, and decorative panels.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-accent-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/designer" className="hover:text-accent-400 transition">
                  Designer
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-accent-400 transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-accent-400 transition">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Materials */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Materials</h4>
            <ul className="space-y-2 text-sm">
              <li>Mild Steel</li>
              <li>Stainless Steel</li>
              <li>Aluminum</li>
              <li>Various Thicknesses (1-6mm)</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@spartandesign.com" className="hover:text-accent-400 transition">
                  info@spartandesign.com
                </a>
              </li>
              <li className="flex items-center gap-2 mt-4">
                <a
                  href="https://github.com/Xbjornsen/SpartanDesign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-400 transition"
                  aria-label="GitHub"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Spartan Design. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
