"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SummonImage from "@/components/ui/SummonImage";
import { createLostRelic } from "@/actions/lost-found";
import { Loader2, PlusCircle, Trash2, MapPin, Lock, Search } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

// Schema matching the server action validation
const formSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().optional(),
    type: z.enum(["LOST", "FOUND"]),
    secretRiddle: z.string().optional(),
    hiddenTruth: z.string().optional(),
}).refine((data) => {
    if (data.type === "FOUND") {
        return !!data.secretRiddle && data.secretRiddle.length > 0 && !!data.hiddenTruth && data.hiddenTruth.length > 0;
    }
    return true;
}, {
    message: "Security questions are required for Found items",
    path: ["secretRiddle"], // Focus error on riddle
});

export function ReportRelicForm() {
    const router = useRouter();
    const [images, setImages] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState("");
    const [reportType, setReportType] = useState<"LOST" | "FOUND">("FOUND");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            location: "",
            type: "FOUND",
            secretRiddle: "",
            hiddenTruth: "",
        },
    });

    // Update form value when tab changes
    const onTabChange = (value: string) => {
        const newType = value as "LOST" | "FOUND";
        setReportType(newType);
        form.setValue("type", newType);
        // Clear errors when switching types to avoid confusing validation messages
        form.clearErrors();
    };

    const handleImageUpload = (url: string) => {
        setImages((prev) => [...prev, url]);
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (images.length === 0) {
            toast.error("Please upload at least one image.");
            return;
        }

        setIsSubmitting(true);
        setServerError("");

        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        if (values.location) formData.append("location", values.location);
        formData.append("type", values.type);

        // Only append security fields if they have values (for FOUND items)
        if (values.secretRiddle && values.secretRiddle.length > 0) {
            formData.append("secretRiddle", values.secretRiddle);
        }
        if (values.hiddenTruth && values.hiddenTruth.length > 0) {
            formData.append("hiddenTruth", values.hiddenTruth);
        }

        formData.append("images", images.join(","));

        const result = await createLostRelic(null, formData);

        if (result.success) {
            router.push(`/dashboard/lost-found?type=${values.type}`);
        } else {
            toast(result.error || "Something went wrong. Please try again.");
            if (result.errors) {
                console.error(result.errors);
            }
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <Card className="bg-stone-900 border-stone-800 text-stone-100">
                <CardHeader>
                    <CardTitle className="text-2xl text-amber-500 flex items-center gap-2">
                        {reportType === "FOUND" ? <PlusCircle className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                        {reportType === "FOUND" ? "Report Found Item" : "Report Lost Item"}
                    </CardTitle>
                    <CardDescription className="text-stone-400">
                        {reportType === "FOUND"
                            ? "You found something? Great! Help it find its way back home."
                            : "Lost something precious? Let the community help you find it."}
                    </CardDescription>

                    <Tabs value={reportType} onValueChange={onTabChange} className="w-full mt-4">
                        <TabsList className="grid w-full grid-cols-2 bg-stone-950 border border-stone-800">
                            <TabsTrigger value="FOUND" className="data-[state=active]:bg-stone-800 data-[state=active]:text-emerald-400 text-stone-500">
                                I Found Something
                            </TabsTrigger>
                            <TabsTrigger value="LOST" className="data-[state=active]:bg-stone-800 data-[state=active]:text-amber-400 text-stone-500">
                                I Lost Something
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {/* Image Upload Section */}
                            <div className="space-y-3">
                                <FormLabel>
                                    {reportType === "FOUND" ? "Evidence (Images)" : "Reference Images"}
                                </FormLabel>

                                {images.length === 0 ? (
                                    // Banner layout for initial upload
                                    <SummonImage onUploadComplete={handleImageUpload} variant="banner" className="w-full" />
                                ) : (
                                    // Grid layout for subsequent uploads
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        {images.map((img, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-stone-700 group">
                                                <Image src={img} alt="Evidence" fill className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-900/80 p-1.5 rounded-full text-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {images.length < 3 && (
                                            <SummonImage onUploadComplete={handleImageUpload} variant="tile" className="h-full min-h-[120px]" />
                                        )}
                                    </div>
                                )}

                                {serverError && images.length === 0 && (
                                    <p className="text-sm font-medium text-destructive">{serverError}</p>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Item Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Black Umbrella" {...field} className="bg-stone-950 border-stone-800" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{reportType === "FOUND" ? "Found Location" : "Last Seen Location"}</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
                                                    <Input placeholder={reportType === "FOUND" ? "e.g. Library 2nd Floor" : "e.g. Cafeteria"} {...field} className="pl-9 bg-stone-950 border-stone-800" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe the item condition, distinct features..."
                                                className="bg-stone-950 border-stone-800 min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {reportType === "FOUND" && (
                                <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                                        <Lock className="w-5 h-5" />
                                        <h3 className="font-semibold">Security Verification</h3>
                                    </div>
                                    <p className="text-xs text-stone-500 mb-4">
                                        To ensure this item returns to its rightful owner, set a question only they would know.
                                    </p>

                                    <FormField
                                        control={form.control}
                                        name="secretRiddle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-200/80">The Riddle (Question)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. What name is engraved on the handle?"
                                                        {...field}
                                                        className="bg-stone-950 border-stone-800 focus:border-amber-700"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="hiddenTruth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-amber-200/80">The Hidden Truth (Answer)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="The secret answer..."
                                                        {...field}
                                                        className="bg-stone-950 border-stone-800 focus:border-amber-700"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                            {serverError && (
                                <p className="text-sm font-medium text-destructive">{serverError}</p>
                            )}

                            <Button type="submit" disabled={isSubmitting} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-6">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Recording Discovery...
                                    </>
                                ) : (
                                    reportType === "FOUND" ? "Report Found Item" : "Report Lost Item"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
