import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Book {
    id: number;
    title: string;
    author: string;
    category: string;
    stock: number;
}

interface Member {
    id: number;
    name: string;
    email: string;
    membercode: string;
}

interface Borrowing {
    id: number;
    member_id: number;
    member_name: string;
    member_email: string;
    books: Array<{
        id: number;
        title: string;
        author: string;
    }>;
    borrow_date: string;
    due_date: string;
    return_date?: string;
    status: 'borrowed' | 'returned' | 'overdue';
    created_at: string;
    updated_at: string;
}

interface BorrowingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (borrowing: Borrowing) => void;
}

// Mock data - in real app this would come from props or API
const mockMembers: Member[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', membercode: 'M001' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', membercode: 'M002' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', membercode: 'M003' },
];

const mockBooks: Book[] = [
    { id: 1, title: 'Belajar React', author: 'Developer A', category: 'Programming', stock: 5 },
    { id: 2, title: 'PHP untuk Pemula', author: 'Developer B', category: 'Programming', stock: 3 },
    { id: 3, title: 'Database MySQL', author: 'Developer C', category: 'Database', stock: 2 },
    { id: 4, title: 'Pemrograman Laravel', author: 'Developer D', category: 'Programming', stock: 4 },
];

export function BorrowingModal({ isOpen, onClose, onSuccess }: BorrowingModalProps) {
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
    const [borrowDate, setBorrowDate] = useState<Date>(new Date());
    const [dueDate, setDueDate] = useState<Date>(() => {
        const date = new Date();
        date.setDate(date.getDate() + 7); // Default 7 days from now
        return date;
    });
    const [memberOpen, setMemberOpen] = useState(false);
    const [bookOpen, setBookOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleReset = () => {
        setSelectedMember(null);
        setSelectedBooks([]);
        setBorrowDate(new Date());
        const defaultDue = new Date();
        defaultDue.setDate(defaultDue.getDate() + 7);
        setDueDate(defaultDue);
        setMemberOpen(false);
        setBookOpen(false);
        setIsSubmitting(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handleSelectBook = (book: Book) => {
        if (selectedBooks.find(b => b.id === book.id)) {
            return; // Already selected
        }
        if (book.stock <= 0) {
            return; // Out of stock
        }
        setSelectedBooks(prev => [...prev, book]);
        setBookOpen(false);
    };

    const handleRemoveBook = (bookId: number) => {
        setSelectedBooks(prev => prev.filter(b => b.id !== bookId));
    };

    const availableBooks = mockBooks.filter(book => 
        book.stock > 0 && !selectedBooks.find(selected => selected.id === book.id)
    );

    const handleSubmit = async () => {
        if (!selectedMember || selectedBooks.length === 0) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const newBorrowing: Borrowing = {
                id: Date.now(), // Mock ID
                member_id: selectedMember.id,
                member_name: selectedMember.name,
                member_email: selectedMember.email,
                books: selectedBooks.map(book => ({
                    id: book.id,
                    title: book.title,
                    author: book.author,
                })),
                borrow_date: borrowDate.toISOString(),
                due_date: dueDate.toISOString(),
                status: 'borrowed' as const,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            onSuccess(newBorrowing);
            handleReset();
        } catch (error) {
            console.error('Error creating borrowing:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Peminjaman Baru</DialogTitle>
                    <DialogDescription>
                        Pilih anggota dan buku yang akan dipinjam
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Member Selection */}
                    <div className="space-y-2">
                        <Label>Anggota</Label>
                        <Popover open={memberOpen} onOpenChange={setMemberOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={memberOpen}
                                    className="w-full justify-between"
                                >
                                    {selectedMember ? (
                                        <div className="flex flex-col items-start">
                                            <span>{selectedMember.name}</span>
                                            <span className="text-sm text-muted-foreground">{selectedMember.email}</span>
                                        </div>
                                    ) : (
                                        "Pilih anggota..."
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Cari anggota..." />
                                    <CommandEmpty>Anggota tidak ditemukan.</CommandEmpty>
                                    <CommandList>
                                        <CommandGroup>
                                            {mockMembers.map((member) => (
                                                <CommandItem
                                                    key={member.id}
                                                    onSelect={() => {
                                                        setSelectedMember(member);
                                                        setMemberOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedMember?.id === member.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span>{member.name}</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {member.email} • {member.membercode}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Book Selection */}
                    <div className="space-y-2">
                        <Label>Buku yang Dipinjam</Label>
                        
                        {/* Selected Books */}
                        {selectedBooks.length > 0 && (
                            <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                                <Label className="text-sm font-medium">Buku Terpilih:</Label>
                                <div className="space-y-2">
                                    {selectedBooks.map((book) => (
                                        <div key={book.id} className="flex items-center justify-between p-2 border rounded-md bg-background">
                                            <div>
                                                <div className="font-medium">{book.title}</div>
                                                <div className="text-sm text-muted-foreground">oleh {book.author}</div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRemoveBook(book.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Add Book */}
                        <Popover open={bookOpen} onOpenChange={setBookOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    disabled={availableBooks.length === 0}
                                >
                                    {availableBooks.length === 0 ? "Tidak ada buku tersedia" : "Tambah Buku"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                                <Command>
                                    <CommandInput placeholder="Cari buku..." />
                                    <CommandEmpty>Buku tidak ditemukan.</CommandEmpty>
                                    <CommandList>
                                        <CommandGroup>
                                            {availableBooks.map((book) => (
                                                <CommandItem
                                                    key={book.id}
                                                    onSelect={() => handleSelectBook(book)}
                                                >
                                                    <div className="flex flex-col w-full">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{book.title}</span>
                                                            <Badge variant="secondary">
                                                                Stok: {book.stock}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            oleh {book.author} • {book.category}
                                                        </span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Tanggal Pinjam</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !borrowDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {borrowDate ? (
                                            format(borrowDate, "PPP", { locale: id })
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={borrowDate}
                                        onSelect={(date) => date && setBorrowDate(date)}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Tanggal Jatuh Tempo</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? (
                                            format(dueDate, "PPP", { locale: id })
                                        ) : (
                                            <span>Pilih tanggal</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={(date) => date && setDueDate(date)}
                                        disabled={(date) => date < borrowDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!selectedMember || selectedBooks.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Peminjaman'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
