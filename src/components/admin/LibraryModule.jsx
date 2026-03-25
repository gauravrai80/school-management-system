import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X, BookOpen, RotateCcw, Loader2 } from "lucide-react";
import api from "@/config/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { fetchCollection, getErrorMessage } from "@/lib/api-helpers";
import { EmptyState, ErrorState, SectionSkeleton } from "@/components/common/QueryFeedback";

const LibraryModule = () => {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("catalog");
  const [page, setPage] = useState(1);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [bookForm, setBookForm] = useState({ title: "", author: "", category: "Academic", totalCopies: 1, availableCopies: 1 });
  const [issueForm, setIssueForm] = useState({ bookId: "", studentId: "", dueDate: "" });

  const today = new Date().toISOString().split("T")[0];

  // Fetch books
  const booksQuery = useQuery({
    queryKey: ['library-books', page],
    queryFn: () => fetchCollection(() => api.get(`/library/books?page=${page}&limit=9`)),
  });

  // Fetch students for issue selection
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await api.get('/students?limit=1000');
      return res.data.data;
    }
  });

  // Mutations
  const addBookMutation = useMutation({
    mutationFn: (data) => api.post('/library/books', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      toast.success("Book added to catalog");
      setAddBookOpen(false);
      setBookForm({ title: "", author: "", category: "Academic", totalCopies: 1, availableCopies: 1 });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to add book"))
  });

  const issueBookMutation = useMutation({
    mutationFn: (data) => api.post('/library/issue', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      toast.success("Book issued successfully");
      setIssueOpen(false);
      setIssueForm({ bookId: "", studentId: "", dueDate: "" });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to issue book"))
  });

  const returnBookMutation = useMutation({
    mutationFn: ({ issueId, bookId }) => api.put(`/library/return/${issueId}`, { bookId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      toast.success("Book returned");
    },
    onError: (error) => toast.error(getErrorMessage(error, "Failed to return book"))
  });

  const handleAddBook = () => {
    if (!bookForm.title || !bookForm.author) {
      toast.error("Title and author required");
      return;
    }
    addBookMutation.mutate({ ...bookForm, availableCopies: bookForm.totalCopies });
  };

  const handleIssue = () => {
    if (!issueForm.bookId || !issueForm.studentId || !issueForm.dueDate) {
      toast.error("All fields required");
      return;
    }
    issueBookMutation.mutate(issueForm);
  };

  const books = booksQuery.data?.items ?? [];
  const pagination = booksQuery.data?.pagination ?? { page: 1, limit: 9, total: 0 };
  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / (pagination.limit || 9)));
  const activeIssues = books.flatMap(b => (b.issuedTo || []).filter(i => i.status === 'issued').map(i => ({ ...i, bookTitle: b.title, bookId: b._id })));

  if (booksQuery.isLoading) {
    return <SectionSkeleton label="Loading library catalog..." />;
  }

  if (booksQuery.isError) {
    return <ErrorState message="Unable to load library books." onRetry={booksQuery.refetch} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-2xl font-display font-bold text-foreground">Library</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTab("catalog")}
            className={`px-4 py-2 rounded-lg font-body text-sm transition-all ${tab === "catalog" ? "bg-gold text-gold-foreground" : "glass text-text-muted"}`}
          >
            Catalog
          </button>
          <button
            onClick={() => setTab("issued")}
            className={`px-4 py-2 rounded-lg font-body text-sm transition-all ${tab === "issued" ? "bg-gold text-gold-foreground" : "glass text-text-muted"}`}
          >
            Issued ({activeIssues.length})
          </button>
        </div>
      </div>

      {tab === "catalog" ? (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => setAddBookOpen(true)}
              className="btn-gold py-2 px-4 text-xs flex items-center gap-2"
            >
              <Plus size={14} /> Add Book
            </button>
            <button
              onClick={() => setIssueOpen(true)}
              className="glass py-2 px-4 text-xs flex items-center gap-2 text-gold hover:bg-white/5"
            >
              <BookOpen size={14} /> Issue Book
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <motion.div key={book._id} layout className="glass rounded-xl p-5 border border-border/10">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                    <BookOpen size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{book.category}</span>
                </div>
                <h3 className="font-display font-bold text-foreground line-clamp-1">{book.title}</h3>
                <p className="text-sm text-text-muted font-body mb-4">{book.author}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/10">
                  <div className="text-xs font-body text-text-muted">
                    Available: <span className="text-gold font-bold">{book.availableCopies}</span> / {book.totalCopies}
                  </div>
                </div>
              </motion.div>
            ))}
            {books.length === 0 ? <div className="col-span-full"><EmptyState title="Library catalog is empty" description="Add books to start managing the catalog." /></div> : null}
          </div>
          <div className="flex items-center justify-between text-sm text-text-muted mt-4">
            <span>Page {pagination.page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="glass px-4 py-2 rounded-lg disabled:opacity-50">
                Previous
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="glass px-4 py-2 rounded-lg disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="glass rounded-xl overflow-hidden border border-border/10">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-border/10">
              <tr>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Book</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Issued To</th>
                <th className="px-4 py-3 text-[10px] uppercase font-bold text-text-muted">Due Date</th>
                <th className="px-4 py-3 text-right text-[10px] uppercase font-bold text-text-muted">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeIssues.map((issue) => (
                <tr key={issue._id} className="border-b border-border/10 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-body text-sm text-foreground">{issue.bookTitle}</td>
                  <td className="px-4 py-3 font-body text-sm text-text-muted">
                    {students.find(s => s._id === issue.studentId)?.userId?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-text-muted">{new Date(issue.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => returnBookMutation.mutate({ issueId: issue._id, bookId: issue.bookId })}
                      className="text-gold hover:text-gold-hover transition-colors p-2"
                      title="Return Book"
                    >
                      <RotateCcw size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {activeIssues.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-text-muted font-body">No books currently issued.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Book Modal */}
      <AnimatePresence>
        {addBookOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/70 backdrop-blur-sm"
            onClick={() => setAddBookOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">Add Book</h3>
                <button onClick={() => setAddBookOpen(false)} className="text-text-muted">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Title</label>
                  <input
                    type="text"
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Author</label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1">Category</label>
                    <select
                      value={bookForm.category}
                      onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                      className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                    >
                      <option value="Academic" className="bg-card">Academic</option>
                      <option value="Fiction" className="bg-card">Fiction</option>
                      <option value="Reference" className="bg-card">Reference</option>
                      <option value="Sci-Fi" className="bg-card">Sci-Fi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-body text-text-muted mb-1">Total Copies</label>
                    <input
                      type="number"
                      value={bookForm.totalCopies}
                      onChange={(e) => setBookForm({ ...bookForm, totalCopies: Number(e.target.value) })}
                      className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddBook}
                disabled={addBookMutation.isPending}
                className="w-full btn-gold mt-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                {addBookMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Add Book"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue Book Modal */}
      <AnimatePresence>
        {issueOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setIssueOpen(false)}
          >
            <div className="glass-strong rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-display font-bold text-foreground">Issue Book</h3>
                <button onClick={() => setIssueOpen(false)} className="text-text-muted">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Select Book</label>
                  <select
                    value={issueForm.bookId}
                    onChange={(e) => setIssueForm({ ...issueForm, bookId: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                  >
                    <option value="" className="bg-card">Choose a book</option>
                    {books.filter(b => b.availableCopies > 0).map((b) => (
                      <option key={b._id} value={b._id} className="bg-card">
                        {b.title} ({b.availableCopies} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Student</label>
                  <select
                    value={issueForm.studentId}
                    onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                  >
                    <option value="" className="bg-card">Select student</option>
                    {students.map((s) => (
                      <option key={s._id} value={s._id} className="bg-card">
                        {s.userId?.name} (Roll: {s.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-body text-text-muted mb-1">Due Date</label>
                  <input
                    type="date"
                    value={issueForm.dueDate}
                    onChange={(e) => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-foreground font-body text-sm focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={handleIssue}
                disabled={issueBookMutation.isPending}
                className="w-full btn-gold mt-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                {issueBookMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : "Confirm Issue"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LibraryModule;
