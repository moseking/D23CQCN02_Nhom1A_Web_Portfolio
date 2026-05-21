import { motion } from 'motion/react';
import { UserPlus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const creators = [
  {
    id: 1,
    name: 'Nhi Nguyen',
    role: 'UI/UX Designer',
    followers: '12.5K',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    verified: true,
  },
  {
    id: 2,
    name: 'An Tran',
    role: 'Brand Designer',
    followers: '8.2K',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
    verified: true,
  },
  {
    id: 3,
    name: 'Minh Le',
    role: 'Digital Artist',
    followers: '15.7K',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    verified: true,
  },
  {
    id: 4,
    name: 'Vy Pham',
    role: 'Product Designer',
    followers: '9.8K',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    verified: false,
  },
  {
    id: 5,
    name: 'Huy Nguyen',
    role: 'Illustrator',
    followers: '11.3K',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    verified: true,
  },
  {
    id: 6,
    name: 'Linh Vo',
    role: 'Motion Designer',
    followers: '7.9K',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    verified: false,
  },
];

export function TrendingCreators() {
  return (
    <section className="bg-white py-20 border-t border-[#E5E7E1]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#9CAF88] font-semibold mb-2">Community</p>
            <h2 className="text-4xl text-[#2D2D2D]" style={{ fontFamily: "'DM Serif Display', serif" }}>Trending Creators</h2>
            <p className="text-[#6B7280] mt-2">Follow talented designers and get inspired by their work</p>
          </div>
          <button className="text-sm text-[#7C8C6B] hover:text-[#9CAF88] font-medium transition-colors self-start sm:self-auto">
            View all creators →
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {creators.map((creator, index) => (
            <motion.div
              key={creator.id}
              className="group bg-[#F6F7F2] rounded-2xl p-6 hover:bg-white border border-transparent hover:border-[#E5E7E1] hover:shadow-md transition-all duration-300 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#E5E7E1] group-hover:ring-[#AEC3AE] transition-all bg-[#E5E7E1]">
                    <ImageWithFallback
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {creator.verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#9CAF88] rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[#2D2D2D] truncate">{creator.name}</h3>
                  <p className="text-sm text-[#6B7280]">{creator.role}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E5E7E1]">
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wide">Followers</p>
                  <p className="font-semibold text-[#2D2D2D]">{creator.followers}</p>
                </div>

                <button className="flex items-center gap-1.5 px-4 py-2 bg-[#E5E7E1] text-[#7C8C6B] rounded-full text-sm hover:bg-[#9CAF88] hover:text-white transition-colors font-medium">
                  <UserPlus className="w-3.5 h-3.5" />
                  Follow
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
