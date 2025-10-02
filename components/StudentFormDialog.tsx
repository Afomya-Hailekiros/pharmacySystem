// components/StudentFormDialog.tsx
"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { createStudent, updateStudent } from "@/lib/api";

export default function StudentFormDialog({
  open,
  onOpenChange,
  student,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  student?: any | null;
  onSaved: () => void;
}) {
  const defaultForm = {
    studentId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
    address: { street: "", city: "", state: "", zip: "", country: "" },
  };

  const [form, setForm] = useState<any>(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      // preload the student value into the form
      setForm({
        studentId: student.studentId ?? "",
        firstName: student.firstName ?? "",
        middleName: student.middleName ?? "",
        lastName: student.lastName ?? "",
        gender: student.gender ?? "",
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
        phoneNumber: student.phoneNumber ?? "",
        address: {
          street: student.address?.street ?? "",
          city: student.address?.city ?? "",
          state: student.address?.state ?? "",
          zip: student.address?.zip ?? "",
          country: student.address?.country ?? "",
        },
      });
    } else {
      setForm(defaultForm);
    }
  }, [student, open]);

  function setField(name: string, value: any) {
    setForm((p: any) => ({ ...p, [name]: value }));
  }
  function setAddr(name: string, value: any) {
    setForm((p: any) => ({ ...p, address: { ...(p.address || {}), [name]: value } }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // basic validation
    if (!form.firstName || !form.lastName) {
      toast.error("Please enter name");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        studentId: form.studentId,
        firstName: form.firstName,
        middleName: form.middleName,
        lastName: form.lastName,
        gender: form.gender,
        dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
        phoneNumber: form.phoneNumber,
        address: form.address,
      };

      if (student?._id) {
        await updateStudent(student._id, payload);
        toast.success("Updated student");
      } else {
        await createStudent(payload);
        toast.success("Student added");
      }

      onSaved();
      onOpenChange(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student ? "Edit Student" : "Add Student"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label>Student ID</Label>
            <Input value={form.studentId} onChange={(e) => setField("studentId", e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} />
            </div>
            <div>
              <Label>Middle Name</Label>
              <Input value={form.middleName} onChange={(e) => setField("middleName", e.target.value)} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Gender</Label>
              <Input value={form.gender} onChange={(e) => setField("gender", e.target.value)} placeholder="Female / Male / Other"/>
            </div>
            <div>
              <Label>Date of birth</Label>
              <Input type="date" value={form.dateOfBirth} onChange={(e) => setField("dateOfBirth", e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phoneNumber} onChange={(e) => setField("phoneNumber", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Street</Label>
              <Input value={form.address?.street} onChange={(e) => setAddr("street", e.target.value)} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.address?.city} onChange={(e) => setAddr("city", e.target.value)} />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={form.address?.country} onChange={(e) => setAddr("country", e.target.value)} />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} type="button">Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : student ? "Update" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
