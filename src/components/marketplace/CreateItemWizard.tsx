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
import { createCursedObject } from "@/app/actions/marketplace";
import { CldUploadWidget, CldImage } from "next-cloudinary";

const formSchema = z.object({
    title: z.string().min(3, "The legend must be at least 3 characters."),
    description: z.string().min(10, "The lore must be descriptive (min 10 chars)."),
    imageUrl: z.string().url("Must be a valid URL (for now)."),
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
            imageUrl: "",
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
        if (currentStep === 2) fieldsToValidate = ["imageUrl"];

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
            router.push("/dashboard/market");
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
                                            name="imageUrl"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-zinc-300">Object Visual</FormLabel>
                                                    <FormControl>
                                                        <div className="space-y-4">
                                                            <CldUploadWidget
                                                                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                                                onSuccess={(result: any) => {
                                                                    field.onChange(result.info.secure_url);
                                                                }}
                                                            >
                                                                {({ open }) => {
                                                                    return (
                                                                        <div
                                                                            onClick={() => open()}
                                                                            className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center hover:border-purple-500 hover:bg-zinc-900/50 transition-all cursor-pointer group"
                                                                        >
                                                                            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                                                                                <Upload className="w-6 h-6 text-zinc-400 group-hover:text-purple-500" />
                                                                            </div>
                                                                            <p className="text-zinc-300 font-medium mb-1">Upload Evidence</p>
                                                                            <p className="text-zinc-500 text-sm">Click to upload image</p>
                                                                        </div>
                                                                    );
                                                                }}
                                                            </CldUploadWidget>
                                                            <Input type="hidden" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {form.watch("imageUrl") && (
                                            <div className="relative aspect-square w-full max-w-sm mx-auto rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 mt-4">
                                                <CldImage
                                                    src={form.watch("imageUrl")}
                                                    alt="Preview"
                                                    width="600"
                                                    height="600"
                                                    className="object-cover w-full h-full"
                                                    crop={{
                                                        type: 'auto',
                                                        source: true
                                                    }}
                                                />
                                            </div>
                                        )}
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
