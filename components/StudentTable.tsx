// components/StudentTable.tsx
"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function StudentTable({
  students,
  onEdit,
  onDelete,
}: {
  students: any[];
  onEdit: (s: any) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Full name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>City</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((s) => (
            <TableRow key={s._id}>
              <TableCell>{s.studentId || "-"}</TableCell>
              <TableCell>{s.fullName || `${s.firstName ?? ""} ${s.lastName ?? ""}`}</TableCell>
              <TableCell>{s.gender ?? "-"}</TableCell>
              <TableCell>{s.age ?? "-"}</TableCell>
              <TableCell>{s.phoneNumber ?? "-"}</TableCell>
              <TableCell>{s.address?.city ?? "-"}</TableCell>
              <TableCell className="flex gap-2">
                <Button size="sm" onClick={() => onEdit(s)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(s._id)}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
