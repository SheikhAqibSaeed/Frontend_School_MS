'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookOpen, Plus } from 'lucide-react';
import {
  createLibraryBook,
  deleteLibraryBook,
  listLibraryBooks,
  updateLibraryBook,
} from '@/services/api/academics.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTablePagination } from '@/components/common/DataTablePagination';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Row = Record<string, unknown>;

export default function LibraryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    copiesTotal: '1',
    copiesAvail: '',
    shelf: '',
  });

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['library-books', page, limit],
    queryFn: () => listLibraryBooks({ page, limit }),
    placeholderData: (p) => p,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const copiesTotal = Number(form.copiesTotal) || 1;
      const copiesAvail = form.copiesAvail.trim() ? Number(form.copiesAvail) : copiesTotal;
      const body: Record<string, unknown> = {
        title: form.title.trim(),
        author: form.author.trim() || undefined,
        isbn: form.isbn.trim() || undefined,
        copiesTotal,
        copiesAvail,
        shelf: form.shelf.trim() || undefined,
      };
      if (editing?.id) return updateLibraryBook(String(editing.id), body);
      return createLibraryBook(body);
    },
    onSuccess: () => {
      toast.success(editing ? 'Book updated' : 'Book added');
      setModalOpen(false);
      setEditing(null);
      void queryClient.invalidateQueries({ queryKey: ['library-books'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLibraryBook(id),
    onSuccess: () => {
      toast.success('Book removed');
      setPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ['library-books'] });
    },
    onError: (e: Error) => toast.error(e.message ?? 'Delete failed'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', author: '', isbn: '', copiesTotal: '1', copiesAvail: '', shelf: '' });
    setModalOpen(true);
  };

  const openEdit = (row: Row) => {
    setEditing(row);
    setForm({
      title: String(row.title ?? ''),
      author: row.author != null ? String(row.author) : '',
      isbn: row.isbn != null ? String(row.isbn) : '',
      copiesTotal: String(row.copiesTotal ?? 1),
      copiesAvail: String(row.copiesAvail ?? row.copiesTotal ?? 1),
      shelf: row.shelf != null ? String(row.shelf) : '',
    });
    setModalOpen(true);
  };

  const items = data?.items ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;
  const totalCopies = items.reduce((sum, b) => sum + Number(b.copiesTotal ?? 0), 0);
  const availCopies = items.reduce((sum, b) => sum + Number(b.copiesAvail ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">Manage books and inventory for the active school.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add book
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Titles on page</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-primary" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Total copies (page)</p>
              <p className="text-2xl font-bold">{totalCopies}</p>
            </div>
            <BookOpen className="h-8 w-8 text-emerald-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Available (page)</p>
              <p className="text-2xl font-bold">{availCopies}</p>
            </div>
            <BookOpen className="h-8 w-8 text-violet-600" />
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete?.id && deleteMutation.mutate(String(pendingDelete.id))}
        title="Delete book"
        message={pendingDelete ? `Delete "${String(pendingDelete.title)}"?` : ''}
        confirmText="Delete"
        variant="danger"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit book' : 'Add book'}
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saveMutation.isPending || !form.title.trim()}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Add'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Author" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
          <Input label="ISBN" value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          <Input
            label="Total copies *"
            type="number"
            min={1}
            value={form.copiesTotal}
            onChange={(e) => setForm({ ...form, copiesTotal: e.target.value })}
          />
          <Input
            label="Available copies"
            type="number"
            min={0}
            value={form.copiesAvail}
            onChange={(e) => setForm({ ...form, copiesAvail: e.target.value })}
          />
          <Input label="Shelf" value={form.shelf} onChange={(e) => setForm({ ...form, shelf: e.target.value })} />
        </div>
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Books</CardTitle>
          <CardDescription>{data ? `${total} total` : isLoading ? 'Loading…' : 'No books yet'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Could not load</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length === 0 && (
            <Alert>
              <AlertTitle>No books</AlertTitle>
              <AlertDescription>Add books to build your library catalog.</AlertDescription>
            </Alert>
          )}
          {!isLoading && !error && items.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>ISBN</TableHead>
                    <TableHead>Copies</TableHead>
                    <TableHead>Shelf</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => (
                    <TableRow key={String(row.id)}>
                      <TableCell>{String(row.title ?? '')}</TableCell>
                      <TableCell>{String(row.author ?? '—')}</TableCell>
                      <TableCell>{String(row.isbn ?? '—')}</TableCell>
                      <TableCell>
                        {String(row.copiesAvail ?? 0)} / {String(row.copiesTotal ?? 0)}
                      </TableCell>
                      <TableCell>{String(row.shelf ?? '—')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => openEdit(row)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setPendingDelete(row)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <DataTablePagination
                page={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                disabled={isFetching}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}