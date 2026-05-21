import { Heart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProjectCardProps {
  image: string;
  title: string;
  creator: string;
  avatar: string;
  likes: number;
  views: number;
  tags: string[];
}

export function ProjectCard({ image, title, creator, avatar, likes, views, tags }: ProjectCardProps) {
  return (
    <motion.div
      className="group cursor-pointer mb-6"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#E5E7E1] shadow-sm group-hover:shadow-lg transition-shadow duration-300">
        <div className="overflow-hidden">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D]/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3 text-white text-sm">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{views}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden bg-[#E5E7E1] ring-2 ring-[#AEC3AE]/40">
            <ImageWithFallback
              src={avatar}
              alt={creator}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-sm font-medium text-[#2D2D2D]">{creator}</p>
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="w-4 h-4 text-[#9CAF88] hover:fill-[#9CAF88] transition-colors" />
        </button>
      </div>

      <h3 className="mt-1.5 text-sm text-[#6B7280] line-clamp-1 px-1">{title}</h3>

      <div className="mt-2 flex flex-wrap gap-1 px-1">
        {tags.slice(0, 3).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-0.5 bg-[#E5E7E1] text-xs text-[#7C8C6B] rounded-full font-medium"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
