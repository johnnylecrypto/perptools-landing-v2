import { platform } from "@/content/platform";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@/components/icons/check";
import { CardLabel } from "./card-label";
import { PlatformCard } from "./platform-card";
import { Progress } from "./progress";

export function TasksCard() {
  const { tasks } = platform;

  return (
    <PlatformCard delay={330} className="flex w-full flex-col gap-8 lg:flex-1">
      <div className="flex items-center justify-between">
        <CardLabel>{tasks.label}</CardLabel>
        <CardLabel>{tasks.resets}</CardLabel>
      </div>

      <ul className="flex flex-col gap-3">
        {tasks.items.map((task, index) => (
          <li
            key={task.label}
            className="flex items-center gap-[13px]"
            style={{ "--i": index } as React.CSSProperties}
          >
            <span className="flex flex-1 items-center gap-[8.2px]">
              {task.done ? (
                <CheckIcon />
              ) : (
                <span aria-hidden className="size-4 rounded-[2px] border border-white/25" />
              )}
              <span
                className={cn(
                  "led-task-text text-[12px] font-medium",
                  task.done ? "text-white/50" : "text-white/88",
                )}
              >
                {task.label}
              </span>
            </span>

            <span className="w-[90px] sm:w-[140.43px]">
              <Progress value={task.progress} color={task.done ? "#3FD08B" : "#2BB9F3"} />
            </span>

            <span
              className={cn(
                "led-task-text w-[61px] text-right text-[12px] font-bold",
                task.done ? "text-[rgb(63_208_139/0.95)]" : "text-[rgb(43_185_243/0.95)]",
              )}
            >
              {task.reward}
            </span>
          </li>
        ))}
      </ul>
    </PlatformCard>
  );
}
