import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MemberModal } from '@/components/member-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { 
    Users, 
    Plus, 
    Search, 
    Eye, 
    Edit, 
    Trash2, 
    Grid3X3, 
    Table as TableIcon, 
    SortAsc,
    SortDesc,
    Mail,
    User,
    AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Members',
        href: '/members',
    },
];

interface Member {
    id: number;
    name: string;
    email: string;
    membercode: string;
    created_at: string;
    updated_at: string;
}

interface MembersProps {
    members: Member[];
}

export default function Members({ members = [] }: MembersProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [memberList, setMemberList] = useState<Member[]>(members);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'membercode'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [loading, setLoading] = useState(false);
    const [modalState, setModalState] = useState({
        isOpen: false,
        mode: 'create' as 'create' | 'edit' | 'view',
        selectedMember: null as Member | null,
    });
    const [deleteModalState, setDeleteModalState] = useState({
        isOpen: false,
        selectedMember: null as Member | null,
    });

    // Update member list when members prop changes
    useEffect(() => {
        setMemberList(members);
    }, [members]);

    // Filter and sort members
    const filteredAndSortedMembers = memberList
        .filter(member => {
            const matchesSearch = 
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.membercode.toLowerCase().includes(searchTerm.toLowerCase());
            
            return matchesSearch;
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
    const openModal = (mode: 'create' | 'edit' | 'view', member?: Member) => {
        console.log('Opening modal:', mode, member);
        setModalState({
            isOpen: true,
            mode,
            selectedMember: member || null,
        });
    };

    const closeModal = () => {
        console.log('Closing modal');
        setModalState({
            isOpen: false,
            mode: 'create',
            selectedMember: null,
        });
    };

    const openDeleteModal = (member: Member) => {
        console.log('Opening delete modal for member:', member);
        setDeleteModalState({
            isOpen: true,
            selectedMember: member,
        });
    };

    const closeDeleteModal = () => {
        console.log('Closing delete modal');
        setDeleteModalState({
            isOpen: false,
            selectedMember: null,
        });
    };

    // CRUD operations
    const handleCreateMember = (memberData: Partial<Member>) => {
        setLoading(true);
        
        router.post('/members', memberData, {
            onSuccess: () => {
                toast.success('Member Added', {
                    description: `"${memberData.name}" has been successfully added as a member.`
                });
                closeModal();
            },
            onError: (errors) => {
                console.error('Error creating member:', errors);
                toast.error('Error', {
                    description: 'Failed to add member. Please try again.'
                });
            },
            onFinish: () => setLoading(false)
        });
    };

    const handleUpdateMember = (memberData: Partial<Member>) => {
        if (!modalState.selectedMember) return;
        
        setLoading(true);
        console.log('Updating member:', modalState.selectedMember.id, memberData);
        
        router.patch(`/members/${modalState.selectedMember.id}`, memberData, {
            onSuccess: () => {
                console.log('Update successful');
                toast.success('Member Updated', {
                    description: `"${memberData.name}" has been successfully updated.`
                });
                closeModal();
            },
            onError: (errors) => {
                console.error('Error updating member:', errors);
                toast.error('Error', {
                    description: 'Failed to update member. Please try again.'
                });
            },
            onFinish: () => setLoading(false)
        });
    };

    const handleDeleteMember = () => {
        if (!deleteModalState.selectedMember) return;
        
        setLoading(true);
        const deletedMember = deleteModalState.selectedMember;
        console.log('Deleting member:', deletedMember.id);
        
        router.delete(`/members/${deleteModalState.selectedMember.id}`, {
            onSuccess: () => {
                console.log('Delete successful');
                toast.success('Member Deleted', {
                    description: `"${deletedMember.name}" has been successfully removed from the system.`
                });
                closeDeleteModal();
            },
            onError: (errors) => {
                console.error('Error deleting member:', errors);
                toast.error('Error', {
                    description: 'Failed to delete member. Please try again.'
                });
            },
            onFinish: () => setLoading(false)
        });
    };

    // Sort handler
    const handleSort = (field: 'name' | 'email' | 'membercode') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field: 'name' | 'email' | 'membercode') => {
        if (sortBy !== field) return null;
        return sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Members" />
            
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            <Users className="h-8 w-8" />
                            Members
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your library members and their information.
                        </p>
                    </div>
                    <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Member
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{memberList.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Registered members
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {memberList.filter(member => {
                                    const memberDate = new Date(member.created_at);
                                    const now = new Date();
                                    const currentMonth = now.getMonth();
                                    const currentYear = now.getFullYear();
                                    return memberDate.getMonth() === currentMonth && memberDate.getFullYear() === currentYear;
                                }).length}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                New registrations
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{memberList.length}</div>
                            <p className="text-xs text-muted-foreground">
                                All members active
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Controls */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search members by name, email, or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                        >
                            <TableIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Members Display */}
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'table')}>
                    <TabsContent value="grid" className="mt-0">
                        {filteredAndSortedMembers.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <Users className="h-16 w-16 text-muted-foreground/50" />
                                    <h3 className="text-lg font-semibold mt-4">No members found</h3>
                                    <p className="text-muted-foreground text-center max-w-sm">
                                        {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first member'}
                                    </p>
                                    {!searchTerm && (
                                        <Button onClick={() => openModal('create')} className="mt-4">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add First Member
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredAndSortedMembers.map((member) => (
                                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="text-lg">{member.name}</CardTitle>
                                                    <CardDescription className="flex items-center gap-1">
                                                        <Mail className="h-3 w-3" />
                                                        {member.email}
                                                    </CardDescription>
                                                </div>
                                                <Badge variant="secondary">
                                                    {member.membercode}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="text-sm text-muted-foreground">
                                                Joined {new Date(member.created_at).toLocaleDateString()}
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openModal('view', member)}
                                                className="flex-1"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openModal('edit', member)}
                                                className="flex-1"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openDeleteModal(member)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="table" className="mt-0">
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('membercode')}
                                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                                >
                                                    Member Code
                                                    {getSortIcon('membercode')}
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('name')}
                                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                                >
                                                    Name
                                                    {getSortIcon('name')}
                                                </Button>
                                            </TableHead>
                                            <TableHead>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('email')}
                                                    className="h-auto p-0 font-semibold hover:bg-transparent"
                                                >
                                                    Email
                                                    {getSortIcon('email')}
                                                </Button>
                                            </TableHead>
                                            <TableHead>Join Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAndSortedMembers.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <Users className="h-12 w-12 text-muted-foreground/50" />
                                                        <div>
                                                            <p className="font-medium">No members found</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first member'}
                                                            </p>
                                                        </div>
                                                        {!searchTerm && (
                                                            <Button onClick={() => openModal('create')}>
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add First Member
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredAndSortedMembers.map((member) => (
                                                <TableRow key={member.id}>
                                                    <TableCell>
                                                        <Badge variant="secondary">
                                                            {member.membercode}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{member.name}</TableCell>
                                                    <TableCell>{member.email}</TableCell>
                                                    <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openModal('view', member)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openModal('edit', member)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openDeleteModal(member)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Modals */}
                <MemberModal
                    isOpen={modalState.isOpen}
                    onClose={closeModal}
                    mode={modalState.mode}
                    member={modalState.selectedMember}
                    onSave={modalState.mode === 'create' ? handleCreateMember : handleUpdateMember}
                />

                {/* Delete Confirmation Modal */}
                <Dialog open={deleteModalState.isOpen} onOpenChange={closeDeleteModal}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" />
                                Delete Member
                            </DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete the member from your system.
                            </DialogDescription>
                        </DialogHeader>

                        {deleteModalState.selectedMember && (
                            <div className="py-4">
                                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                                    <h4 className="font-semibold text-destructive mb-2">Member to be deleted:</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Name:</span> {deleteModalState.selectedMember.name}</p>
                                        <p><span className="font-medium">Email:</span> {deleteModalState.selectedMember.email}</p>
                                        <p><span className="font-medium">Member Code:</span> {deleteModalState.selectedMember.membercode}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={closeDeleteModal}>
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteMember} 
                                className="gap-2"
                                disabled={loading}
                            >
                                <Trash2 className="h-4 w-4" />
                                {loading ? 'Deleting...' : 'Delete Member'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
