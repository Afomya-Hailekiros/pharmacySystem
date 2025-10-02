// app/students/page.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import StudentTable from "@/components/StudentTable";
import StudentFormDialog from "@/components/StudentFormDialog";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { getStudents, deleteStudent } from "@/lib/api";
import toast from "react-hot-toast";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onEdit(student: any) {
    setEditing(student);
    setFormOpen(true);
  }

  function onAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function onDeleteClick(id: string) {
    setDeletingId(id);
    setDeleteOpen(true);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteStudent(deletingId);
      toast.success("Deleted");
      setDeleteOpen(false);
      setDeletingId(null);
      load();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <div className="flex gap-2">
          <Button onClick={onAdd}>+ Add student</Button>
          <Button variant="outline" onClick={load}>Refresh</Button>
        </div>
      </div>

      <div className="mb-4">
        {loading ? <p>Loading...</p> : <StudentTable students={students} onEdit={onEdit} onDelete={onDeleteClick} />}
      </div>

      <StudentFormDialog
        open={formOpen}
        onOpenChange={(v) => setFormOpen(v)}
        student={editing}
        onSaved={() => load()}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={(v) => setDeleteOpen(v)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
