import Masonry from 'react-responsive-masonry';
import { ProjectCard } from './ProjectCard';

const projects = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1767449441925-737379bc2c4d?w=800',
    title: 'Mobile Banking App - Modern UI Design',
    creator: 'Nhi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    likes: 342,
    views: 5420,
    tags: ['UI/UX', 'Mobile', 'Fintech'],
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1697033300784-6c9d143a30e2?w=800',
    title: 'Colorful Abstract Brand Identity',
    creator: 'An',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    likes: 287,
    views: 4210,
    tags: ['Branding', 'Abstract', 'Colorful'],
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1762341119237-98df67c9c3c9?w=800',
    title: 'Health & Fitness Mobile Interface',
    creator: 'Minh',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    likes: 421,
    views: 6830,
    tags: ['Health', 'Mobile App', 'UI Design'],
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1705453168890-6c244eb82942?w=800',
    title: 'Dark Modern Dashboard Design',
    creator: 'Vy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    likes: 512,
    views: 7920,
    tags: ['Dashboard', 'Dark Mode', 'Web'],
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1611926945285-9fa3dabd5b51?w=800',
    title: 'Vibrant Poster Series - Abstract Art',
    creator: 'Huy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    likes: 198,
    views: 3240,
    tags: ['Poster', 'Abstract', 'Print'],
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1767449280971-46e438b1ce4a?w=800',
    title: 'Educational Platform - Learning App',
    creator: 'Linh',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
    likes: 356,
    views: 5120,
    tags: ['Education', 'UI/UX', 'Mobile'],
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1770709507890-4089ec2d8f99?w=800',
    title: 'Geometric Architecture Photography',
    creator: 'Nhi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    likes: 445,
    views: 6340,
    tags: ['Photography', 'Architecture', 'Creative'],
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1684569546963-792efe6b2a10?w=800',
    title: '3D Abstract Shapes Collection',
    creator: 'An',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    likes: 623,
    views: 9210,
    tags: ['3D', 'Abstract', 'Digital Art'],
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1613759007428-9d918fe2d36f?w=800',
    title: 'Birthday Branding - Colorful Design',
    creator: 'Minh',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    likes: 234,
    views: 3890,
    tags: ['Branding', 'Typography', 'Print'],
  },
  {
    id: 10,
    image: 'https://images.unsplash.com/photo-1741298167030-9e0ce6ab08dc?w=800',
    title: 'Neon Gradient Lines - Digital Art',
    creator: 'Vy',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    likes: 578,
    views: 8450,
    tags: ['Digital Art', 'Gradient', 'Modern'],
  },
];

const categories = ['All', 'UI/UX', 'Branding', 'Illustration', 'Photography', '3D', 'Motion'];

export function ExploreFeed() {
  return (
    <section className="max-w-[1400px] mx-auto px-6 py-16">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#9CAF88] font-semibold mb-2">Discover</p>
          <h2 className="text-4xl text-[#2D2D2D]" style={{ fontFamily: "'DM Serif Display', serif" }}>Creative Works</h2>
          <p className="text-[#6B7280] mt-2">Explore thousands of projects from talented creators worldwide</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === 0
                ? 'bg-[#9CAF88] text-white'
                : 'bg-[#E5E7E1] text-[#6B7280] hover:bg-[#AEC3AE] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <Masonry columnsCount={3} gutter="24px">
        {projects.map((project) => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </Masonry>

      <div className="mt-12 text-center">
        <button className="px-8 py-3 border border-[#9CAF88] text-[#7C8C6B] rounded-full hover:bg-[#9CAF88] hover:text-white transition-all font-medium">
          Load More Projects
        </button>
      </div>
    </section>
  );
}
