import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Book, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

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

interface ReturnModalProps {
    isOpen: boolean;
    onClose: () => void;
    borrowing: Borrowing;
    onSuccess: (borrowingId: number) => void;
}

export function ReturnModal({ isOpen, onClose, borrowing, onSuccess }: ReturnModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysOverdue = () => {
        const dueDate = new Date(borrowing.due_date);
        const today = new Date();
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const isOverdue = getDaysOverdue() > 0;

    const handleReturn = async () => {
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            onSuccess(borrowing.id);
            onClose();
        } catch (error) {
            console.error('Error returning books:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Konfirmasi Pengembalian</DialogTitle>
                    <DialogDescription>
                        Pastikan semua buku telah dikembalikan dalam kondisi baik
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Member Info */}
                    <div className="flex items-start space-x-3 p-3 border rounded-lg">
                        <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                            <div className="font-medium">{borrowing.member_name}</div>
                            <div className="text-sm text-muted-foreground">{borrowing.member_email}</div>
                        </div>
                    </div>

                    {/* Books List */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <Book className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">Buku yang dikembalikan:</span>
                        </div>
                        <div className="space-y-2 pl-6">
                            {borrowing.books.map((book) => (
                                <div key={book.id} className="text-sm">
                                    <div className="font-medium">{book.title}</div>
                                    <div className="text-muted-foreground">oleh {book.author}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dates Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="flex items-center space-x-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Tanggal Pinjam:</span>
                            </div>
                            <div className="font-medium">{formatDate(borrowing.borrow_date)}</div>
                        </div>
                        <div>
                            <div className="flex items-center space-x-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Jatuh Tempo:</span>
                            </div>
                            <div className="font-medium">{formatDate(borrowing.due_date)}</div>
                        </div>
                    </div>

                    {/* Overdue Warning */}
                    {isOverdue && (
                        <div className="flex items-start space-x-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                                <div className="font-medium text-orange-800">Terlambat Pengembalian</div>
                                <div className="text-sm text-orange-700">
                                    Buku terlambat dikembalikan selama {getDaysOverdue()} hari. 
                                    Mungkin akan dikenakan denda sesuai kebijakan perpustakaan.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">Status saat ini:</span>
                        {borrowing.status === 'borrowed' && (
                            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Dipinjam</Badge>
                        )}
                        {borrowing.status === 'overdue' && (
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Terlambat</Badge>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button 
                        onClick={handleReturn} 
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isSubmitting ? 'Memproses...' : 'Konfirmasi Pengembalian'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
