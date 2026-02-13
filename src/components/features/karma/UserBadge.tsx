"use client";

import { KARMA_BADGES } from "@/lib/karma-constants";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UserBadgeProps {
    karma: number;
    className?: string;
    showTooltip?: boolean;
}

export function UserBadge({ karma, className, showTooltip = true }: UserBadgeProps) {
    const badge = KARMA_BADGES.find(b => karma >= b.min && karma <= b.max) || KARMA_BADGES[0];

    const BadgeContent = (
        <span className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-black/50 backdrop-blur-sm",
            badge.color,
            className
        )}>
            <span className="text-sm">{badge.icon}</span>
            <span>{badge.label}</span>
        </span>
    );

    if (!showTooltip) return BadgeContent;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {BadgeContent}
                </TooltipTrigger>
                <TooltipContent>
                    <p>Karma Score: <span className="font-bold">{karma}</span></p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
