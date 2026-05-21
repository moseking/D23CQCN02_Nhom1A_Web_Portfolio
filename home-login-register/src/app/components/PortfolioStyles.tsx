import { motion } from 'motion/react';
import { Layout, Moon, Palette } from 'lucide-react';

const templates = [
  {
    id: 1,
    name: 'Minimal White',
    description: 'Clean and elegant design with focus on your work',
    icon: Layout,
    preview: 'bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200',
    color: 'text-gray-700',
  },
  {
    id: 2,
    name: 'Dark Cinematic',
    description: 'Bold and dramatic presentation for visual impact',
    icon: Moon,
    preview: 'bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-700',
    color: 'text-purple-600',
  },
  {
    id: 3,
    name: 'Creative Colorful',
    description: 'Vibrant and playful style for expressive portfolios',
    icon: Palette,
    preview: 'bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400',
    color: 'text-pink-600',
  },
];

export function PortfolioStyles() {
  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl mb-3 text-gray-900">Choose Your Portfolio Style</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select from professionally designed templates that automatically showcase your creative work
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {templates.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-shadow duration-300">
                  <div className={`${template.preview} rounded-xl h-48 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300`}>
                    <Icon className="w-16 h-16 text-white/80" strokeWidth={1.5} />
                  </div>

                  <h3 className={`text-xl font-semibold mb-2 ${template.color}`}>
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {template.description}
                  </p>

                  <button className="w-full py-2 border-2 border-gray-200 rounded-lg text-sm text-gray-700 hover:border-purple-600 hover:text-purple-600 transition-colors">
                    Preview Template
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
