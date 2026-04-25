import { TimeCounter } from "@/components/home/time-counter";
import { StatsGrid } from "@/components/home/stats-grid";
import { LoveQuote } from "@/components/home/love-quote";
import { AnniversaryCountdown } from "@/components/home/anniversary-countdown";
import { WeatherWidget } from "@/components/home/weather-widget";
import { QuickActions } from "@/components/home/quick-actions";
import { RecentMemories } from "@/components/home/recent-memories";
import { AvatarPair } from "@/components/home/avatar-pair";
import { MoreNavMobile } from "@/components/layout/nav";

export default function Home() {
  return (
    <div className="space-y-5 animate-fade-up">
      <MoreNavMobile />
      <AvatarPair />
      <TimeCounter />
      <StatsGrid />
      <div className="grid sm:grid-cols-2 gap-4">
        <AnniversaryCountdown />
        <WeatherWidget />
      </div>
      <LoveQuote />
      <QuickActions />
      <RecentMemories />
    </div>
  );
}
