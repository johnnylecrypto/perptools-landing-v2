import { platform } from "@/content/platform";
import { Reveal } from "@/components/ui/reveal";
import { PointsReceipt } from "@/components/sections/points-receipt";
import { ActivityCard } from "./activity-card";
import { BadgesCard } from "./badges-card";
import { PointsCard } from "./points-card";
import { RankCard } from "./rank-card";
import { RewardPoolCard } from "./reward-pool-card";
import { TasksCard } from "./tasks-card";

/**
 * Points dashboard: balance, rank, badges, reward pool, weekly tasks and the
 * live activity feed, laid out on the design file's 1080px grid.
 */
export function Platform() {
  return (
    <section id="platform" aria-labelledby="platform-heading">
      {/* `Reveal` only carries the scroll trigger; everything inside it stays
          server-rendered. The staging is CSS, keyed off the class it adds. */}
      <Reveal className="ledger frame w-full">
        <div className="flex w-full flex-col items-center gap-16 max-sm:gap-8">
          <header className="led-head flex flex-col items-center gap-[18.89px] text-center max-sm:gap-5">
            <h2
              id="platform-heading"
              className="heading-sheen max-w-[874.88px] text-[32px] leading-[38.4px] font-medium text-balance sm:text-[clamp(30px,5vw,48px)] sm:leading-none lg:max-w-none lg:whitespace-nowrap"
            >
              {platform.heading}
            </h2>
            <p className="max-w-[636.28px] text-[16px] leading-[23.86px] text-pretty text-[#7A8494] max-sm:text-[14px]">
              {platform.lede}
            </p>
          </header>

          {/* Phones get the printed receipt instead: the cards below need
              columns a phone does not have. */}
          <PointsReceipt className="sm:hidden" />

          {/* Cards share the row by design ratio rather than fixed px: the
              section fills its padded width now, and fixed widths would leave
              the rows short of the right edge past a 1080px frame. */}
          <div className="flex w-full flex-col gap-4 max-sm:hidden">
            <div className="flex flex-col gap-4 lg:h-[372px] lg:flex-row">
              <PointsCard />
              <RankCard />
              <div className="flex flex-col gap-4 lg:flex-[257_1_0%]">
                <BadgesCard />
                <RewardPoolCard />
              </div>
            </div>

            {/* `min-h`, not `h`: the design's 188px is ~2px short of what the
                four task rows plus the card's padding actually need, and a hard
                height clipped the last row against `Card`'s overflow. */}
            <div className="flex flex-col gap-4 lg:min-h-[188px] lg:flex-row">
              <TasksCard />
              <ActivityCard />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
