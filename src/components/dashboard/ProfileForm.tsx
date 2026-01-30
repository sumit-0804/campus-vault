"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/actions/profile";
import { Loader2, Save, Mail, Link as LinkIcon, Smartphone, Instagram, Linkedin, User } from "lucide-react";
import { useSession } from "next-auth/react";

interface ProfileFormProps {
    initialData: {
        fullName: string;
        email: string;
        phoneNumber?: string | null;
        linkedinUrl?: string | null;
        instagramUrl?: string | null;
    };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const { update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);
        const result = await updateProfile(formData);

        if (result?.error) {
            setMessage({ type: "error", text: result.error });
        } else {
            await update();
            setMessage({ type: "success", text: "Profile updated successfully" });
        }
        setIsLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {/* Personal Details Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#D500F9]">
                    <User className="h-6 w-6" />
                    <h3 className="font-semibold text-lg tracking-wide">Personal Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label htmlFor="fullName" className="text-gray-300 ml-1">Display Name</Label>
                        <Input
                            id="fullName"
                            name="fullName"
                            defaultValue={initialData.fullName}
                            placeholder="e.g. Harry Potter"
                            required
                            className="bg-transparent border-white/20 rounded-lg h-12 text-white placeholder:text-gray-600 focus:border-[#D500F9] focus:ring-[#D500F9]/20 transition-all duration-300"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="phoneNumber" className="text-gray-300 ml-1">Mobile Number</Label>
                        <div className="relative">
                            <Smartphone className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                defaultValue={initialData.phoneNumber || ""}
                                placeholder="e.g. 9876543210"
                                className="pl-10 bg-transparent border-white/20 rounded-lg h-12 text-white placeholder:text-gray-600 focus:border-[#D500F9] focus:ring-[#D500F9]/20 transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 md:col-span-2">
                        <Label htmlFor="email" className="text-gray-300 ml-1">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <Input
                                id="email"
                                value={initialData.email}
                                disabled
                                className="pl-10 bg-white/5 border-white/10 rounded-lg h-12 text-gray-400 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 ml-1">Email cannot be changed directly.</p>
                    </div>
                </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* Social Links Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 text-[#D500F9]">
                    <LinkIcon className="h-6 w-6" />
                    <h3 className="font-semibold text-lg tracking-wide">Social Links <span className="text-gray-500 text-sm font-normal ml-2">(Optional)</span></h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <Label htmlFor="linkedinUrl" className="text-gray-300 ml-1">LinkedIn URL</Label>
                        <div className="relative">
                            <Linkedin className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <Input
                                id="linkedinUrl"
                                name="linkedinUrl"
                                defaultValue={initialData.linkedinUrl || ""}
                                placeholder="https://linkedin.com/in/..."
                                className="pl-10 bg-transparent border-white/20 rounded-lg h-12 text-white placeholder:text-gray-600 focus:border-[#D500F9] focus:ring-[#D500F9]/20 transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="instagramUrl" className="text-gray-300 ml-1">Instagram URL</Label>
                        <div className="relative">
                            <Instagram className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" />
                            <Input
                                id="instagramUrl"
                                name="instagramUrl"
                                defaultValue={initialData.instagramUrl || ""}
                                placeholder="https://instagram.com/..."
                                className="pl-10 bg-transparent border-white/20 rounded-lg h-12 text-white placeholder:text-gray-600 focus:border-[#D500F9] focus:ring-[#D500F9]/20 transition-all duration-300"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex justify-end pt-6">
                <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#D500F9] hover:bg-[#AA00FF] text-white min-w-[160px] h-11 rounded-lg font-medium shadow-lg shadow-purple-900/20 transition-all duration-300"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
