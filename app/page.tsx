import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6">Spartan Design</h1>
          <p className="text-xl mb-8 text-gray-300">
            Professional Laser Cutting Design Platform
          </p>
          <p className="text-lg mb-12 text-gray-400 max-w-2xl mx-auto">
            Design custom laser cut products with our intuitive 3D designer.
            Perfect for gates, flat objects, and custom designs.
          </p>

          <Link
            href="/designer"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg transition"
          >
            Start Designing
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">3D Designer</h3>
            <p className="text-gray-400">
              Visualize your designs in real-time with our interactive 3D canvas
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">Instant Quotes</h3>
            <p className="text-gray-400">
              Get accurate pricing for your laser cutting projects immediately
            </p>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-3">Export Ready</h3>
            <p className="text-gray-400">
              Export your designs as production-ready SVG files
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
