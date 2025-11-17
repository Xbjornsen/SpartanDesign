import DesignCanvas from '@/components/DesignCanvas'

export default function DesignerPage() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Spartan Design - Laser Cutting Designer</h1>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
            Export SVG
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">
            Get Quote
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Tools */}
        <aside className="w-64 bg-gray-100 p-4 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Tools</h2>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-white border rounded hover:bg-gray-50">
              Rectangle
            </button>
            <button className="w-full px-4 py-2 bg-white border rounded hover:bg-gray-50">
              Circle
            </button>
            <button className="w-full px-4 py-2 bg-white border rounded hover:bg-gray-50">
              Custom Path
            </button>
          </div>

          <h2 className="text-lg font-semibold mt-8 mb-4">Material</h2>
          <select className="w-full px-4 py-2 border rounded">
            <option>Acrylic - 3mm</option>
            <option>Wood - 5mm</option>
            <option>Metal - 2mm</option>
          </select>

          <h2 className="text-lg font-semibold mt-8 mb-4">Dimensions</h2>
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1">Width (mm)</label>
              <input type="number" className="w-full px-3 py-2 border rounded" placeholder="100" />
            </div>
            <div>
              <label className="block text-sm mb-1">Height (mm)</label>
              <input type="number" className="w-full px-3 py-2 border rounded" placeholder="100" />
            </div>
          </div>
        </aside>

        {/* Canvas area */}
        <main className="flex-1">
          <DesignCanvas />
        </main>
      </div>
    </div>
  )
}
