"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ImageOff } from "lucide-react";

interface ImageGalleryProps {
    images: string[];
    title?: string;
    className?: string;
}

export function ImageGallery({ images, title = "Item Image", className }: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    // Handle case with no images
    if (!images || images.length === 0) {
        return (
            <div className={cn("aspect-square relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center flex-col gap-3 text-zinc-600 h-[400px] w-full max-w-[400px]", className)}>
                <ImageOff className="w-16 h-16 opacity-30" />
                <span className="text-sm font-medium">No Image Summoned</span>
            </div>
        );
    }

    const selectedImage = images[selectedIndex];

    return (
        <div className={cn("space-y-4", className)}>
            {/* Main Image Stage - Fixed Size */}
            <div
                className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-black/40 shadow-inner group h-[400px] w-full max-w-[400px] mx-auto cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
            >
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full border border-white/20">
                        Click to Zoom
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full relative"
                    >
                        {selectedImage.includes("cloudinary") || !selectedImage.startsWith("http") ? (
                            <CldImage
                                src={selectedImage}
                                alt={title}
                                fill
                                className="object-contain p-2"
                                priority
                                sizes="(max-width: 768px) 100vw, 400px"
                            />
                        ) : (
                            <img
                                src={selectedImage}
                                alt={title}
                                className="w-full h-full object-contain p-2"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x justify-center">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={cn(
                                "relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 snap-start",
                                selectedIndex === idx
                                    ? "border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] scale-105"
                                    : "border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-600"
                            )}
                        >
                            {img.includes("cloudinary") || !img.startsWith("http") ? (
                                <CldImage
                                    src={img}
                                    alt={`View ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="100px"
                                    format="auto"
                                    quality="auto"
                                />
                            ) : (
                                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-5xl h-[85vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsLightboxOpen(false)}
                                className="absolute -top-12 right-0 md:-right-4 text-zinc-400 hover:text-white transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>

                            {/* Full Image */}
                            {selectedImage.includes("cloudinary") || !selectedImage.startsWith("http") ? (
                                <CldImage
                                    src={selectedImage}
                                    alt={title}
                                    width={1200}
                                    height={1200}
                                    className="max-h-full max-w-full object-contain"
                                    priority
                                />
                            ) : (
                                <img
                                    src={selectedImage}
                                    alt={title}
                                    className="max-h-full max-w-full object-contain"
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
