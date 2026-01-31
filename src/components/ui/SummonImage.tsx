"use client";

import { useState, useRef } from "react";
import { Upload, CloudUpload, Loader2 } from "lucide-react";

interface SummonImageProps {
    onUploadComplete: (url: string) => void;
    label?: string;
    className?: string;
    variant?: "banner" | "tile";
}

export default function SummonImage({
    onUploadComplete,
    label = "Summon Visual",
    className = "",
    variant = "tile",
    multiple = false
}: SummonImageProps & { multiple?: boolean }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const uploadFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            alert(`File ${file.name} is not an image.`);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "campus-vault-unsigned");
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
        formData.append("cloud_name", cloudName);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (data.secure_url) {
                onUploadComplete(data.secure_url);
            } else {
                console.error("Upload failed", data);
                alert(`Upload failed for ${file.name}`);
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("Upload failed. Please try again.");
        }
    };

    const processFiles = async (files: FileList | File[]) => {
        setIsUploading(true);
        const fileArray = Array.from(files);

        // Process sequentially to keep order roughly or avoiding browser freeze (though fetch is async)
        // Parallel is fine for a few images
        await Promise.all(fileArray.map(uploadFile));

        setIsUploading(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            if (!multiple && files.length > 1) {
                // If not multiple, take the first one
                await uploadFile(files[0]);
                setIsUploading(false); // Manually set false here as processFiles isn't called
            } else {
                await processFiles(files);
            }
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await processFiles(files);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const triggerFileSelect = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    // Determine styling based on drag state
    const dragClasses = isDragging
        ? "border-amber-500 bg-stone-900/80 scale-[0.99]"
        : "border-stone-700 bg-stone-900/30 hover:border-amber-500/50 hover:bg-stone-900/50";

    const tileDragClasses = isDragging
        ? "border-purple-500 bg-zinc-900/80 scale-[0.99]"
        : "border-zinc-700 hover:border-purple-500 hover:bg-zinc-900/50";

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
                multiple={multiple}
            />

            {variant === "banner" ? (
                <div
                    onClick={triggerFileSelect}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer group relative overflow-hidden ${dragClasses} ${className}`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center py-4">
                            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                            <p className="text-stone-400 font-medium">Summoning artifact(s)...</p>
                        </div>
                    ) : (
                        <>
                            <div className={`w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mx-auto mb-4 transition-colors shadow-lg shadow-black/20 ${isDragging ? "bg-amber-500/20 text-amber-500" : "group-hover:bg-amber-500/10 group-hover:text-amber-500"}`}>
                                <CloudUpload className={`w-8 h-8 ${isDragging ? "text-amber-500" : "text-stone-400 group-hover:text-amber-500"}`} />
                            </div>
                            <p className={`font-medium mb-1 text-lg transition-colors ${isDragging ? "text-amber-400" : "text-stone-300"}`}>
                                {isDragging ? "Drop to Summon!" : multiple ? "Click or drag images here" : "Click or drag image here"}
                            </p>
                            <p className="text-stone-500 text-sm">Supports JPG, PNG, HEIC • Auto-compressed</p>
                        </>
                    )}
                </div>
            ) : (
                <div
                    onClick={triggerFileSelect}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer group h-full min-h-[120px] relative overflow-hidden ${tileDragClasses} ${className}`}
                >
                    {isUploading ? (
                        <div className="flex flex-col items-center justify-center">
                            <Loader2 className="w-6 h-6 text-purple-500 animate-spin mb-2" />
                            <p className="text-xs text-zinc-500">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <div className={`w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2 transition-colors ${isDragging ? "bg-purple-500/20 text-purple-400" : "group-hover:bg-purple-500/20 group-hover:text-purple-400"}`}>
                                <Upload className={`w-5 h-5 ${isDragging ? "text-purple-500" : "text-zinc-400 group-hover:text-purple-500"}`} />
                            </div>
                            <p className={`text-xs font-medium transition-colors ${isDragging ? "text-purple-400" : "text-zinc-500"}`}>
                                {isDragging ? "Drop!" : "Add Image"}
                            </p>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
