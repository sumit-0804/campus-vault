"use client";

import { CheckCircle2, Circle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface HandoffTimelineProps {
    relic: {
        status: string;
        claimerVerifiedAt: Date | null;
        droppedOffAt: Date | null;
        deliveredAt: Date | null;
    };
}

export function HandoffTimeline({ relic }: HandoffTimelineProps) {
    const steps = [
        {
            label: "Verified",
            completed: relic.status !== "OPEN",
            timestamp: relic.claimerVerifiedAt,
        },
        {
            label: "Dropped Off",
            completed: ["DROPPED_OFF", "DELIVERED", "SOLVED"].includes(relic.status),
            timestamp: relic.droppedOffAt,
        },
        {
            label: "Delivered",
            completed: ["DELIVERED", "SOLVED"].includes(relic.status),
            timestamp: relic.deliveredAt,
        },
    ];

    return (
        <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-200 mb-4">Handoff Progress</h3>
            <div className="space-y-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="mt-0.5">
                            {step.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <Circle className="w-5 h-5 text-zinc-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${step.completed ? "text-zinc-200" : "text-zinc-500"}`}>
                                {step.label}
                            </p>
                            {step.timestamp && (
                                <p className="text-xs text-zinc-500 mt-0.5">
                                    {formatDistanceToNow(new Date(step.timestamp), { addSuffix: true })}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
