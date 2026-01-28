"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    accent: "red" | "purple" | "blue";
}

export default function FeatureCard({
    icon,
    title,
    description,
    accent,
}: FeatureCardProps) {
    const accentMap = {
        red: "border-red-500/30 bg-gradient-to-br from-red-900/30",
        purple: "border-purple-500/30 bg-gradient-to-br from-purple-900/30",
        blue: "border-blue-500/30 bg-gradient-to-br from-blue-900/30",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
        >
            <Card
                className={`h-full border backdrop-blur-xl ${accentMap[accent]} gap-0`}
            >
                <CardHeader className="p-2 sm:pb-0">
                    <CardTitle className="text-base sm:text-lg md:text-xl font-black">
                        <div className="flex items-center gap-2">
                            <div className="m-2 sm:m-4">{icon}</div>
                            {title}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2 sm:py-2 sm:px-4">
                    <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
