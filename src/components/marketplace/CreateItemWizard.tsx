"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, ChevronLeft, Upload, Ghost } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCursedObject } from "@/actions/marketplace";
import { CldImage } from "next-cloudinary";
import SummonImage from "@/components/ui/SummonImage";

const formSchema = z.object({
    title: z.string().min(3, "The legend must be at least 3 characters."),
    description: z.string().min(10, "The lore must be descriptive (min 10 chars)."),
    images: z.array(z.string()).min(1, "You must summon at least one visual."),
    price: z.coerce.number().min(0, "Price cannot be negative."),
    condition: z.string().min(1, "Condition is required."),
    category: z.string().min(1, "Category is required."),
});

const steps = [
    { id: 1, title: "The Legend", description: "Name your cursed object and describe its lore." },
    { id: 2, title: "Visuals", description: "Show us the artifact." },
    { id: 3, title: "The Pact", description: "Set the price and condition." },
];

export default function CreateItemWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            images: [],
            price: 0,
            condition: "New",
            category: "Artifacts",
        },
        mode: "onChange",
    });

    const { formState: { isValid, isSubmitting } } = form;

    const nextStep = async () => {
        // Validate current step fields before moving
        let fieldsToValidate: any[] = [];
        if (currentStep === 1) fieldsToValidate = ["title", "description"];
        if (currentStep === 2) fieldsToValidate = ["images"];

        const result = await form.trigger(fieldsToValidate);

        if (result) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const res = await createCursedObject(values);

        if (res.success) {
            router.push("/dashboard/listings");
            router.refresh();
        } else {
            alert(res.error);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            {/* Progress */}
            <div className="mb-8 relative">
                <div className="flex justify-between items-center z-10 relative">
                    {steps.map((step) => (
                        <div key={step.id} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                    ${step.id <= currentStep ? 'bg-purple-600 border-purple-600 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-500'}
                `}>
                                {step.id < currentStep ? "✓" : step.id}
                            </div>
                            <span className={`text-xs mt-2 font-medium ${step.id <= currentStep ? 'text-purple-400' : 'text-zinc-600'}`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="absolute top-5 left-0 w-full h-0.5 bg-zinc-800 -z-0">
                    <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }} />
                </div>
            </div>

            <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Ghost className="w-5 h-5 text-purple-500" />
                        {steps[currentStep - 1].title}
                    </CardTitle>
                    <p className="text-zinc-400 text-sm">{steps[currentStep - 1].description}</p>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-zinc-300">Name of the Object</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Cursed Amulet of exams" {...field} className="bg-zinc-950 border-zinc-700" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-zinc-300">Lore & Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Tell the tale of this item..." {...field} className="bg-zinc-950 border-zinc-700 min-h-[120px]" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                )}

                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="images"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-zinc-300">Object Visuals</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-4">
                                                            {field.value.length === 0 ? (
                                                                <SummonImage
                                                                    label="Upload Evidence"
                                                                    onUploadComplete={(url) => field.onChange([...field.value, url])}
                                                                    variant="banner"
                                                                    multiple={true}
                                                                />
                                                            ) : (
                                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                                    {field.value.map((url, idx) => (
                                                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700 group bg-zinc-950">
                                                                            <CldImage
                                                                                src={url}
                                                                                alt={`Evidence ${idx + 1}`}
                                                                                fill
                                                                                className="object-cover"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => field.onChange(field.value.filter((_, i) => i !== idx))}
                                                                                className="absolute top-1 right-1 bg-red-900/80 p-1.5 rounded-full text-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                    {field.value.length < 5 && (
                                                                        <SummonImage
                                                                            onUploadComplete={(url) => field.onChange([...field.value, url])}
                                                                            variant="tile"
                                                                            multiple={true}
                                                                            className="h-full min-h-[120px]"
                                                                        />
                                                                    )}
                                                                </div>
                                                            )}
                                                            <FormMessage />
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                )}

                                {currentStep === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="price"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-300">Price ($)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} className="bg-zinc-950 border-zinc-700" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-zinc-300">Category</FormLabel>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="bg-zinc-950 border-zinc-700">
                                                                    <SelectValue placeholder="Select category" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                                                <SelectItem value="Electronics">Potions (Electronics)</SelectItem>
                                                                <SelectItem value="Books">Scrolls (Books)</SelectItem>
                                                                <SelectItem value="Artifacts">Artifacts (Misc)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="condition"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-zinc-300">Condition</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-zinc-950 border-zinc-700">
                                                                <SelectValue placeholder="Select condition" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                                                            <SelectItem value="New">Mint Condition</SelectItem>
                                                            <SelectItem value="Like New">Slightly Haunted</SelectItem>
                                                            <SelectItem value="Used">Ancient</SelectItem>
                                                            <SelectItem value="Damaged">Cursed/Broken</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between border-t border-zinc-800 pt-6">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    {currentStep < steps.length ? (
                        <Button onClick={nextStep} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={form.handleSubmit(onSubmit)} className="bg-green-600 hover:bg-green-700 text-white font-bold tracking-wide">
                            Summon Item
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
