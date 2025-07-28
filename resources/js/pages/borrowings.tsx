import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BorrowingModal } from '@/components/borrowing-modal';
import { ReturnModal } from '@/components/return-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { 
    BookOpen, 
    Plus, 
    Search, 
    RotateCcw, 
    Grid3X3, 
    Table as TableIcon, 
    SortAsc,
    SortDesc,
    Calendar,
    User,
    Book,
    Clock
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Borrowings',
        href: '/borrowings',
    },
];

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

interface BorrowingsProps {
    borrowings: Borrowing[];
}

export default function Borrowings({ borrowings: initialBorrowings }: BorrowingsProps) {
    const [borrowings, setBorrowings] = useState<Borrowing[]>(initialBorrowings || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<string>('borrow_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

    // Filter and sort borrowings
    const filteredBorrowings = borrowings
        .filter(borrowing => {
            const matchesSearch = 
                borrowing.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                borrowing.member_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                borrowing.books.some(book => 
                    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchTerm.toLowerCase())
                );
            
            const matchesStatus = statusFilter === 'all' || borrowing.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            const aValue = a[sortField as keyof Borrowing] || '';
            const bValue = b[sortField as keyof Borrowing] || '';
            
            if (sortDirection === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'returned':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Dikembalikan</Badge>;
            case 'borrowed':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Dipinjam</Badge>;
            case 'overdue':
                return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Terlambat</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getDaysRemaining = (dueDate: string, status: string) => {
        if (status === 'returned') return null;
        
        const due = new Date(dueDate);
        const now = new Date();
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return `Terlambat ${Math.abs(diffDays)} hari`;
        if (diffDays === 0) return 'Jatuh tempo hari ini';
        return `${diffDays} hari lagi`;
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
    };

    const handleReturn = (borrowing: Borrowing) => {
        setSelectedBorrowing(borrowing);
        setIsReturnModalOpen(true);
    };

    const handleReturnSuccess = (borrowingId: number) => {
        setBorrowings(prev => 
            prev.map(b => 
                b.id === borrowingId 
                    ? { ...b, status: 'returned' as const, return_date: new Date().toISOString() }
                    : b
            )
        );
        setIsReturnModalOpen(false);
        setSelectedBorrowing(null);
        toast.success('Buku berhasil dikembalikan');
    };

    const handleAddSuccess = (newBorrowing: Borrowing) => {
        setBorrowings(prev => [newBorrowing, ...prev]);
        setIsAddModalOpen(false);
        toast.success('Peminjaman berhasil ditambahkan');
    };

    const borrowedCount = borrowings.filter(b => b.status === 'borrowed').length;
    const returnedCount = borrowings.filter(b => b.status === 'returned').length;
    const overdueCount = borrowings.filter(b => b.status === 'overdue').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Borrowings" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Peminjaman Buku Perpustakaan</h1>
                        <p className="text-muted-foreground">
                            Kelola peminjaman dan pengembalian buku perpustakaan
                        </p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Peminjaman
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Peminjaman</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{borrowings.length}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sedang Dipinjam</CardTitle>
                            <Clock className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{borrowedCount}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sudah Dikembalikan</CardTitle>
                            <RotateCcw className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{returnedCount}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
                            <Calendar className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{overdueCount}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Peminjaman</CardTitle>
                        <CardDescription>
                            Kelola riwayat peminjaman dan pengembalian buku
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex flex-1 items-center space-x-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari anggota atau buku..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="borrowed">Dipinjam</SelectItem>
                                        <SelectItem value="returned">Dikembalikan</SelectItem>
                                        <SelectItem value="overdue">Terlambat</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant={viewMode === 'table' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('table')}
                                >
                                    <TableIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid3X3 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Table View */}
                        {viewMode === 'table' && (
                            <div className="mt-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead 
                                                className="cursor-pointer"
                                                onClick={() => handleSort('member_name')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <User className="h-4 w-4" />
                                                    <span>Anggota</span>
                                                    {getSortIcon('member_name')}
                                                </div>
                                            </TableHead>
                                            <TableHead>
                                                <div className="flex items-center space-x-1">
                                                    <Book className="h-4 w-4" />
                                                    <span>Buku</span>
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer"
                                                onClick={() => handleSort('borrow_date')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>Tanggal Pinjam</span>
                                                    {getSortIcon('borrow_date')}
                                                </div>
                                            </TableHead>
                                            <TableHead 
                                                className="cursor-pointer"
                                                onClick={() => handleSort('due_date')}
                                            >
                                                <div className="flex items-center space-x-1">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Jatuh Tempo</span>
                                                    {getSortIcon('due_date')}
                                                </div>
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredBorrowings.map((borrowing) => (
                                            <TableRow key={borrowing.id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{borrowing.member_name}</div>
                                                        <div className="text-sm text-muted-foreground">{borrowing.member_email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        {borrowing.books.map((book) => (
                                                            <div key={book.id} className="text-sm">
                                                                <div className="font-medium">{book.title}</div>
                                                                <div className="text-muted-foreground">oleh {book.author}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{formatDate(borrowing.borrow_date)}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div>{formatDate(borrowing.due_date)}</div>
                                                        {borrowing.status !== 'returned' && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {getDaysRemaining(borrowing.due_date, borrowing.status)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(borrowing.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {borrowing.status === 'borrowed' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleReturn(borrowing)}
                                                            >
                                                                <RotateCcw className="h-4 w-4 mr-1" />
                                                                Kembalikan
                                                            </Button>
                                                        )}
                                                        {borrowing.status === 'returned' && borrowing.return_date && (
                                                            <div className="text-sm text-muted-foreground">
                                                                Dikembalikan: {formatDate(borrowing.return_date)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                
                                {filteredBorrowings.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Tidak ada data peminjaman ditemukan
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredBorrowings.map((borrowing) => (
                                    <Card key={borrowing.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-base">{borrowing.member_name}</CardTitle>
                                                    <CardDescription>{borrowing.member_email}</CardDescription>
                                                </div>
                                                {getStatusBadge(borrowing.status)}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <h4 className="font-medium text-sm mb-2">Buku yang dipinjam:</h4>
                                                <div className="space-y-1">
                                                    {borrowing.books.map((book) => (
                                                        <div key={book.id} className="text-sm">
                                                            <div className="font-medium">{book.title}</div>
                                                            <div className="text-muted-foreground">oleh {book.author}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Tgl Pinjam:</span>
                                                    <div>{formatDate(borrowing.borrow_date)}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Jatuh Tempo:</span>
                                                    <div>{formatDate(borrowing.due_date)}</div>
                                                    {borrowing.status !== 'returned' && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {getDaysRemaining(borrowing.due_date, borrowing.status)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                        
                                        {borrowing.status === 'borrowed' && (
                                            <CardFooter>
                                                <Button
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => handleReturn(borrowing)}
                                                >
                                                    <RotateCcw className="h-4 w-4 mr-1" />
                                                    Kembalikan Buku
                                                </Button>
                                            </CardFooter>
                                        )}
                                        
                                        {borrowing.status === 'returned' && borrowing.return_date && (
                                            <CardFooter>
                                                <div className="text-sm text-muted-foreground w-full text-center">
                                                    Dikembalikan: {formatDate(borrowing.return_date)}
                                                </div>
                                            </CardFooter>
                                        )}
                                    </Card>
                                ))}
                                
                                {filteredBorrowings.length === 0 && (
                                    <div className="col-span-full text-center py-8 text-muted-foreground">
                                        Tidak ada data peminjaman ditemukan
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add Borrowing Modal */}
            <BorrowingModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            {/* Return Modal */}
            {selectedBorrowing && (
                <ReturnModal
                    isOpen={isReturnModalOpen}
                    onClose={() => {
                        setIsReturnModalOpen(false);
                        setSelectedBorrowing(null);
                    }}
                    borrowing={selectedBorrowing}
                    onSuccess={handleReturnSuccess}
                />
            )}
        </AppLayout>
    );
}
