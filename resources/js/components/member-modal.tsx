import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';
import { Save, Eye, Edit, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Member {
    id: number;
    name: string;
    email: string;
    membercode: string;
    created_at?: string;
    updated_at?: string;
}

interface MemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit' | 'view';
    member?: Member | null;
    onSave?: (member: Partial<Member>) => void;
}

const memberSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Please enter a valid email address').max(100, 'Email must be less than 100 characters'),
});

type MemberFormData = z.infer<typeof memberSchema>;

export function MemberModal({ isOpen, onClose, mode, member, onSave }: MemberModalProps) {
    const form = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            name: '',
            email: '',
        },
    });

    useEffect(() => {
        if (member && (mode === 'edit' || mode === 'view')) {
            form.reset({
                name: member.name,
                email: member.email,
            });
        } else if (mode === 'create') {
            form.reset({
                name: '',
                email: '',
            });
        }
    }, [member, mode, isOpen, form]);

    const onSubmit = (data: MemberFormData) => {
        if (mode === 'view') return;
        onSave?.(data);
        onClose();
    };

    const getModalTitle = () => {
        switch (mode) {
            case 'create': return 'Add New Member';
            case 'edit': return 'Edit Member';
            case 'view': return 'Member Details';
            default: return '';
        }
    };

    const getModalIcon = () => {
        switch (mode) {
            case 'create': return <Plus className="h-4 w-4" />;
            case 'edit': return <Edit className="h-4 w-4" />;
            case 'view': return <Eye className="h-4 w-4" />;
            default: return null;
        }
    };

    const getModalDescription = () => {
        switch (mode) {
            case 'create': return 'Add a new member to your library system.';
            case 'edit': return 'Make changes to this member\'s information.';
            case 'view': return 'View this member\'s details.';
            default: return '';
        }
    };

    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit';
    const isCreateMode = mode === 'create';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getModalIcon()}
                        {getModalTitle()}
                    </DialogTitle>
                    <DialogDescription>
                        {getModalDescription()}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid gap-4 py-4">
                            {/* Member Code (only shown in view and edit modes) */}
                            {(isViewMode || isEditMode) && member && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="membercode" className="text-right">
                                        Member Code
                                    </Label>
                                    <div className="col-span-3">
                                        <Badge variant="secondary" className="text-sm">
                                            {member.membercode}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {/* Name Field */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Name</FormLabel>
                                        <div className="col-span-3 space-y-2">
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter member name"
                                                    disabled={isViewMode}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Email Field */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-4 items-center gap-4">
                                        <FormLabel className="text-right">Email</FormLabel>
                                        <div className="col-span-3 space-y-2">
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Enter email address"
                                                    disabled={isViewMode}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {/* Created/Updated dates (only in view mode) */}
                            {isViewMode && member && (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right text-sm text-muted-foreground">
                                            Created
                                        </Label>
                                        <div className="col-span-3">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(member.created_at || '').toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right text-sm text-muted-foreground">
                                            Updated
                                        </Label>
                                        <div className="col-span-3">
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(member.updated_at || '').toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <DialogFooter>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                {!isViewMode && (
                                    <Button type="submit" className="flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        {isCreateMode ? 'Add Member' : 'Save Changes'}
                                    </Button>
                                )}
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
