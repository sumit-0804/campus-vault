"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FloatingCard } from "@/components/ui/floating-card";
import { CursedObject, ItemStatus } from "@/app/generated/prisma/browser";
import { Clock, Tag } from "lucide-react";
import { FavoriteButton } from "@/components/ui/FavoriteButton";

interface ItemCardProps {
    item: CursedObject;
}

export default function ItemCard({ item }: ItemCardProps) {
    const isReserved = item.status === ItemStatus.RESERVED;
    const isSold = item.status === ItemStatus.SOLD;

    return (
        <FloatingCard delay={Math.random() * 2}>
            <Link href={`/marketplace/${item.id}`}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                >
                    <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50 hover:border-purple-500/50 transition-colors h-full flex flex-col group relative">
                        {/* Status Overlay */}
                        {(isReserved || isSold) && (
                            <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                {isSold ? (
                                    <span className="text-3xl font-black uppercase tracking-widest -rotate-12 border-8 border-red-600 text-red-600 p-4 rounded-xl">
                                        Sold
                                    </span>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                                        animate={{ scale: 1, opacity: 1, rotate: -6 }}
                                        className="bg-lime-400 text-black text-xl font-black uppercase tracking-wider px-6 py-2 shadow-lg shadow-lime-900/20 transform -rotate-6"
                                    >
                                        Reserved
                                    </motion.div>
                                )}
                            </div>
                        )}

                        <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                            {item.images.length > 0 ? (
                                <Image
                                    src={item.images[0]}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                    No Image
                                </div>
                            )}
                            <div className="absolute bottom-2 right-2 z-10 flex gap-2">
                                <Badge variant="secondary" className="bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border-purple-500/30 text-[10px] h-5 px-1.5">
                                    ${item.price.toFixed(2)}
                                </Badge>
                            </div>

                            <FavoriteButton className="absolute top-2 right-2 z-10" />
                        </div>

                        <CardContent className="p-3 flex-grow flex flex-col gap-0.5">
                            <div className="flex justify-between items-center mb-0.5">
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-zinc-700 text-zinc-400">
                                    {item.category}
                                </Badge>
                                <span className="text-[10px] text-zinc-500 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-sm font-bold text-zinc-100 line-clamp-1 group-hover:text-purple-400 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-[10px] text-zinc-400 line-clamp-1 leading-relaxed">
                                {item.description}
                            </p>
                        </CardContent>

                        <CardFooter className="p-3 pt-0 text-[10px] text-zinc-500 flex justify-between items-center border-t border-zinc-800 mt-auto bg-zinc-950/30 h-8">
                            <div className="flex items-center">
                                <Tag className="w-3 h-3 mr-1" />
                                {item.condition}
                            </div>
                        </CardFooter>
                    </Card>
                </motion.div>
            </Link>
        </FloatingCard>
    );
}
