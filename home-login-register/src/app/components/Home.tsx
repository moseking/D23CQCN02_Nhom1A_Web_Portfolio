import { Hero } from './Hero';
import { ExploreFeed } from './ExploreFeed';
import { TrendingCreators } from './TrendingCreators';

export function Home() {
  return (
    <>
      <Hero />
      <ExploreFeed />
      <TrendingCreators />
    </>
  );
}
