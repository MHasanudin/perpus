import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface Book {
    id: number;
    title: string;
    author: string;
    category: string;
    stock: number;
}

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    book?: Book | null;
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm, book }: DeleteConfirmModalProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    if (!book) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Book
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the book from your library.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <h4 className="font-semibold text-destructive mb-2">Book to be deleted:</h4>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Title:</span> {book.title}</p>
                            <p><span className="font-medium">Author:</span> {book.author}</p>
                            <p><span className="font-medium">Category:</span> {book.category}</p>
                            <p><span className="font-medium">Stock:</span> {book.stock} copies</p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm} className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Book
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
