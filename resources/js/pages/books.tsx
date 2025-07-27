import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { BookModal } from '@/components/book-modal';
import { DeleteConfirmModal } from '@/components/delete-confirm-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    BookOpen, 
    Plus, 
    Search, 
    Eye, 
    Edit, 
    Trash2, 
    Grid3X3, 
    Table as TableIcon, 
    Filter,
    SortAsc,
    SortDesc,
    MoreHorizontal,
    Download,
    Upload
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Books',
        href: '/books',
    },
];

interface Book {
    id: number;
    title: string;
    author: string;
    category: string;
    stock: number;
    created_at: string;
    updated_at: string;
}

interface BooksProps {
    books: Book[];
}

// Dummy data for frontend testing
const dummyBooks: Book[] = [
    {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'Fiction',
        stock: 5,
        created_at: '2025-07-27T00:00:00.000000Z',
        updated_at: '2025-07-27T00:00:00.000000Z',
    },
    {
        id: 2,
        title: 'Clean Code',
        author: 'Robert C. Martin',
        category: 'Technology',
        stock: 8,
        created_at: '2025-07-27T00:00:00.000000Z',
        updated_at: '2025-07-27T00:00:00.000000Z',
    },
    {
        id: 3,
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'Fiction',
        stock: 3,
        created_at: '2025-07-27T00:00:00.000000Z',
        updated_at: '2025-07-27T00:00:00.000000Z',
    },
    {
        id: 4,
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        category: 'Non-Fiction',
        stock: 6,
        created_at: '2025-07-27T00:00:00.000000Z',
        updated_at: '2025-07-27T00:00:00.000000Z',
    },
    {
        id: 5,
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        category: 'Science',
        stock: 2,
        created_at: '2025-07-27T00:00:00.000000Z',
        updated_at: '2025-07-27T00:00:00.000000Z',
    },
    {
        id: 6,
        title: 'Steve Jobs',
        author: 'Walter Isaacson',
        category: 'Biography',
        stock: 0,
        created_at: '2025-07-27T00:00:00.000000Z',
        updated_at: '2025-07-27T00:00:00.000000Z',
    },
];

export default function Books({ books = [] }: BooksProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [bookList, setBookList] = useState<Book[]>(books.length > 0 ? books : dummyBooks);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [sortBy, setSortBy] = useState<'title' | 'author' | 'category' | 'stock'>('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'create' as 'create' | 'edit' | 'view',
        selectedBook: null as Book | null,
    });
    const [deleteModalState, setDeleteModalState] = useState({
        isOpen: false,
        selectedBook: null as Book | null,
    });

    // Update book list when books prop changes
    useEffect(() => {
        if (books.length > 0) {
            setBookList(books);
        }
    }, [books]);

    // Get unique categories for filter
    const categories = Array.from(new Set(bookList.map(book => book.category)));

    // Filter and sort books
    const filteredAndSortedBooks = bookList
        .filter(book => {
            const matchesSearch = 
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.category.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = !filterCategory || book.category === filterCategory;
            
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = (bValue as string).toLowerCase();
            }
            
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

    // Modal handlers
    const openModal = (mode: 'create' | 'edit' | 'view', book?: Book) => {
        setModalState({
            isOpen: true,
            mode,
            selectedBook: book || null,
        });
    };

    const closeModal = () => {
        setModalState({
            isOpen: false,
            mode: 'create',
            selectedBook: null,
        });
    };

    const openDeleteModal = (book: Book) => {
        setDeleteModalState({
            isOpen: true,
            selectedBook: book,
        });
    };

    const closeDeleteModal = () => {
        setDeleteModalState({
            isOpen: false,
            selectedBook: null,
        });
    };

    // CRUD operations
    const handleCreateBook = (bookData: Partial<Book>) => {
        setLoading(true);
        const newBook: Book = {
            id: Math.max(...bookList.map(b => b.id), 0) + 1,
            title: bookData.title || '',
            author: bookData.author || '',
            category: bookData.category || '',
            stock: bookData.stock || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        
        setTimeout(() => {
            setBookList(prev => [...prev, newBook]);
            setLoading(false);
            toast.success('Book Added', {
                description: `"${newBook.title}" has been successfully added to your library.`
            });
        }, 500);
    };

    const handleUpdateBook = (bookData: Partial<Book>) => {
        if (!modalState.selectedBook) return;
        
        setLoading(true);
        setTimeout(() => {
            setBookList(prev => prev.map(book => 
                book.id === modalState.selectedBook!.id 
                    ? { 
                        ...book, 
                        ...bookData, 
                        updated_at: new Date().toISOString() 
                    }
                    : book
            ));
            setLoading(false);
            toast.success('Book Updated', {
                description: `"${bookData.title}" has been successfully updated.`
            });
        }, 500);
    };

    const handleDeleteBook = () => {
        if (!deleteModalState.selectedBook) return;
        
        setLoading(true);
        const deletedBook = deleteModalState.selectedBook;
        setTimeout(() => {
            setBookList(prev => prev.filter(book => book.id !== deleteModalState.selectedBook!.id));
            setLoading(false);
            toast.success('Book Deleted', {
                description: `"${deletedBook.title}" has been successfully removed from your library.`
            });
        }, 500);
    };

    const handleSave = (bookData: Partial<Book>) => {
        if (modalState.mode === 'create') {
            handleCreateBook(bookData);
        } else if (modalState.mode === 'edit') {
            handleUpdateBook(bookData);
        }
    };

    const getCategoryColor = (category: string) => {
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Books" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Books Collection</h1>
                        <p className="text-muted-foreground">
                            Manage your library books collection
                        </p>
                    </div>
                    <Button className="sm:w-auto" onClick={() => openModal('create')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Book
                    </Button>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search books by title, author, or category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        {/* Filter by Category */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    {filterCategory || 'All Categories'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56">
                                <Command>
                                    <CommandInput placeholder="Search categories..." />
                                    <CommandList>
                                        <CommandEmpty>No categories found.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem onSelect={() => setFilterCategory('')}>
                                                All Categories
                                            </CommandItem>
                                            {categories.map((category) => (
                                                <CommandItem 
                                                    key={category} 
                                                    onSelect={() => setFilterCategory(category)}
                                                >
                                                    {category}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>

                        {/* Sort Controls */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="gap-2"
                            >
                                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                                {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
                            </Button>
                            
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        Sort by {sortBy}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-40">
                                    <div className="space-y-2">
                                        {(['title', 'author', 'category', 'stock'] as const).map((field) => (
                                            <Button
                                                key={field}
                                                variant={sortBy === field ? 'default' : 'ghost'}
                                                size="sm"
                                                className="w-full justify-start capitalize"
                                                onClick={() => setSortBy(field)}
                                            >
                                                {field}
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {filteredAndSortedBooks.length} book{filteredAndSortedBooks.length !== 1 ? 's' : ''} found
                            </span>
                            {loading && <Progress value={66} className="w-20" />}
                        </div>
                        
                        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'table')}>
                            <TabsList>
                                <TabsTrigger value="grid" className="gap-2">
                                    <Grid3X3 className="h-4 w-4" />
                                    Grid
                                </TabsTrigger>
                                <TabsTrigger value="table" className="gap-2">
                                    <TableIcon className="h-4 w-4" />
                                    Table
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Content Area with Tabs */}
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'table')}>
                    <TabsContent value="grid">
                        {filteredAndSortedBooks.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center py-12">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="rounded-full bg-muted p-4">
                                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">No books found</h3>
                                        <p className="text-muted-foreground">
                                            {searchTerm || filterCategory ? 'Try adjusting your search terms or filters' : 'Get started by adding your first book'}
                                        </p>
                                    </div>
                                    {!searchTerm && !filterCategory && (
                                        <Button onClick={() => openModal('create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Your First Book
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredAndSortedBooks.map((book) => (
                                    <Card key={book.id} className="transition-shadow hover:shadow-md">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <CardTitle className="line-clamp-2 text-lg">{book.title}</CardTitle>
                                                <Badge 
                                                    variant="secondary" 
                                                    className={getCategoryColor(book.category)}
                                                >
                                                    {book.category}
                                                </Badge>
                                            </div>
                                            <CardDescription className="line-clamp-1">
                                                by {book.author}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">Stock:</span>
                                                    <Badge variant={book.stock > 0 ? "default" : "destructive"}>
                                                        {book.stock} {book.stock === 1 ? 'copy' : 'copies'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <div className="flex w-full gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1"
                                                    onClick={() => openModal('view', book)}
                                                >
                                                    <Eye className="mr-1 h-3 w-3" />
                                                    View
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="flex-1"
                                                    onClick={() => openModal('edit', book)}
                                                >
                                                    <Edit className="mr-1 h-3 w-3" />
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    className="flex-1"
                                                    onClick={() => openDeleteModal(book)}
                                                >
                                                    <Trash2 className="mr-1 h-3 w-3" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="table">
                        {filteredAndSortedBooks.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center py-12">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div className="rounded-full bg-muted p-4">
                                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">No books found</h3>
                                        <p className="text-muted-foreground">
                                            {searchTerm || filterCategory ? 'Try adjusting your search terms or filters' : 'Get started by adding your first book'}
                                        </p>
                                    </div>
                                    {!searchTerm && !filterCategory && (
                                        <Button onClick={() => openModal('create')}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Your First Book
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">ID</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Author</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-center">Stock</TableHead>
                                            <TableHead className="text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAndSortedBooks.map((book) => (
                                            <TableRow key={book.id}>
                                                <TableCell className="font-medium">#{book.id}</TableCell>
                                                <TableCell className="font-medium">{book.title}</TableCell>
                                                <TableCell>{book.author}</TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant="secondary" 
                                                        className={getCategoryColor(book.category)}
                                                    >
                                                        {book.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={book.stock > 0 ? "default" : "destructive"}>
                                                        {book.stock}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => openModal('view', book)}
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => openModal('edit', book)}
                                                        >
                                                            <Edit className="h-3 w-3" />
                                                        </Button>
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={() => openDeleteModal(book)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals */}
            <BookModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                mode={modalState.mode}
                book={modalState.selectedBook}
                onSave={handleSave}
            />

            <DeleteConfirmModal
                isOpen={deleteModalState.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteBook}
                book={deleteModalState.selectedBook}
            />
        </AppLayout>
    );
}
