import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';
import { Save, Eye, Edit, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Book {
    id: number;
    title: string;
    author: string;
    category: string;
    stock: number;
    created_at?: string;
    updated_at?: string;
}

interface BookModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit' | 'view';
    book?: Book | null;
    onSave?: (book: Partial<Book>) => void;
}

const categories = [
    'Fiction',
    'Non-Fiction',
    'Science',
    'Technology',
    'History',
    'Biography',
    'Romance',
    'Mystery',
    'Fantasy',
    'Horror',
    'Self-Help',
    'Education',
];

const bookSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
    author: z.string().min(1, 'Author is required').max(255, 'Author must be less than 255 characters'),
    category: z.string().min(1, 'Category is required'),
    stock: z.number().min(0, 'Stock cannot be negative').max(9999, 'Stock is too large'),
});

type BookFormData = z.infer<typeof bookSchema>;

export function BookModal({ isOpen, onClose, mode, book, onSave }: BookModalProps) {
    const form = useForm<BookFormData>({
        resolver: zodResolver(bookSchema),
        defaultValues: {
            title: '',
            author: '',
            category: '',
            stock: 0,
        },
    });

    useEffect(() => {
        if (book && (mode === 'edit' || mode === 'view')) {
            form.reset({
                title: book.title,
                author: book.author,
                category: book.category,
                stock: book.stock,
            });
        } else if (mode === 'create') {
            form.reset({
                title: '',
                author: '',
                category: '',
                stock: 0,
            });
        }
    }, [book, mode, isOpen, form]);

    const onSubmit = (data: BookFormData) => {
        if (mode === 'view') return;
        onSave?.(data);
        onClose();
    };

    const getModalTitle = () => {
        switch (mode) {
            case 'create': return 'Add New Book';
            case 'edit': return 'Edit Book';
            case 'view': return 'Book Details';
            default: return '';
        }
    };

    const getModalIcon = () => {
        switch (mode) {
            case 'create': return <Plus className="h-5 w-5" />;
            case 'edit': return <Edit className="h-5 w-5" />;
            case 'view': return <Eye className="h-5 w-5" />;
            default: return null;
        }
    };

    const getCategoryBadgeColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Fiction': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'Non-Fiction': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'Science': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'Technology': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'History': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'Biography': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
        };
        return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getModalIcon()}
                        {getModalTitle()}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'create' && 'Add a new book to your library collection.'}
                        {mode === 'edit' && 'Update book information and details.'}
                        {mode === 'view' && 'View detailed information about this book.'}
                    </DialogDescription>
                </DialogHeader>

                {mode === 'view' ? (
                    <div className="grid gap-4 py-4">
                        {/* View Mode - Display Only */}
                        <div className="grid gap-2">
                            <Label>Title</Label>
                            <div className="px-3 py-2 bg-muted rounded-md font-medium">
                                {book?.title}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Author</Label>
                            <div className="px-3 py-2 bg-muted rounded-md">
                                {book?.author}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <div className="px-3 py-2 bg-muted rounded-md">
                                <Badge className={getCategoryBadgeColor(book?.category || '')}>
                                    {book?.category}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Stock</Label>
                            <div className="px-3 py-2 bg-muted rounded-md">
                                <Badge variant={book && book.stock > 0 ? "default" : "destructive"}>
                                    {book?.stock} {book?.stock === 1 ? 'copy' : 'copies'}
                                </Badge>
                            </div>
                        </div>

                        {book && (
                            <>
                                <div className="grid gap-2">
                                    <Label>Book ID</Label>
                                    <div className="px-3 py-2 bg-muted rounded-md text-sm">
                                        #{book.id}
                                    </div>
                                </div>
                                {book.created_at && (
                                    <div className="grid gap-2">
                                        <Label>Added Date</Label>
                                        <div className="px-3 py-2 bg-muted rounded-md text-sm">
                                            {new Date(book.created_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter book title" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="author"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Author</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Enter author name" 
                                                {...field} 
                                            />
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
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                placeholder="Enter stock quantity"
                                                min="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Number of copies available in your library
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                )}

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        {mode === 'view' ? 'Close' : 'Cancel'}
                    </Button>
                    {mode !== 'view' && (
                        <Button onClick={form.handleSubmit(onSubmit)} className="gap-2">
                            <Save className="h-4 w-4" />
                            {mode === 'create' ? 'Add Book' : 'Save Changes'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
