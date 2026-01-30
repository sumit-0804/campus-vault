"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CursedObject, ItemStatus } from "@/app/generated/prisma/browser";
import { Clock, Tag } from "lucide-react";

interface ItemCardProps {
    item: CursedObject;
}

export default function ItemCard({ item }: ItemCardProps) {
    const isReserved = item.status === ItemStatus.RESERVED;
    const isSold = item.status === ItemStatus.SOLD;

    return (
        <Link href={`/marketplace/${item.id}`}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
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

                    <div className="relative aspect-square w-full overflow-hidden bg-zinc-800">
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
                        <div className="absolute top-2 right-2 z-10">
                            <Badge variant="secondary" className="bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border-purple-500/30">
                                ${item.price.toFixed(2)}
                            </Badge>
                        </div>
                    </div>

                    <CardContent className="p-4 flex-grow">
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                                {item.category}
                            </Badge>
                            <span className="text-xs text-zinc-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-zinc-100 mb-1 line-clamp-1 group-hover:text-purple-400 transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-sm text-zinc-400 line-clamp-2">
                            {item.description}
                        </p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0 text-xs text-zinc-500 flex justify-between items-center border-t border-zinc-800 mt-auto bg-zinc-950/30">
                        <div className="flex items-center mt-3">
                            <Tag className="w-3 h-3 mr-1" />
                            {item.condition}
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </Link>
    );
}
