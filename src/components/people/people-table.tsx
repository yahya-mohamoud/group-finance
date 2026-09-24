"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Eye,
  Edit2,
  UserCheck,
  UserX,
  Phone,
  Filter,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { EditPersonModal } from "./edit-person-modal";
import { togglePersonStatus } from "@/lib/actions/people";
import { formatCurrency } from "@/lib/currency";

export interface PersonItem {
  id: string;
  name: string;
  phone: string;
  monthlyFee: number;
  active: boolean;
  createdAt: Date | string;
}

interface PeopleTableProps {
  people: PersonItem[];
}

export function PeopleTable({ people }: PeopleTableProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
  const [editingPerson, setEditingPerson] = React.useState<PersonItem | null>(null);

  // Status toggle confirmation dialog
  const [confirmTogglePerson, setConfirmTogglePerson] = React.useState<PersonItem | null>(null);
  const [toggling, setToggling] = React.useState(false);

  const filteredPeople = React.useMemo(() => {
    return people.filter((person) => {
      const matchesSearch =
        person.name.toLowerCase().includes(search.toLowerCase()) ||
        person.phone.includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && person.active) ||
        (statusFilter === "inactive" && !person.active);

      return matchesSearch && matchesStatus;
    });
  }, [people, search, statusFilter]);

  const handleConfirmStatusToggle = async () => {
    if (!confirmTogglePerson) return;
    setToggling(true);
    try {
      await togglePersonStatus(confirmTogglePerson.id, !confirmTogglePerson.active);
      setConfirmTogglePerson(null);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === "all"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All ({people.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === "active"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active ({people.filter((p) => p.active).length})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === "inactive"
                  ? "bg-teal-700 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Inactive ({people.filter((p) => !p.active).length})
            </button>
          </div>
        </div>
      </div>

      {/* People Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {filteredPeople.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-600">No members found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Register a person using the button above to get started."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-semibold text-slate-900">
                    <Link
                      href={`/people/${person.id}`}
                      className="hover:text-teal-700 hover:underline flex items-center gap-1.5"
                    >
                      {person.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {person.phone}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">
                    {formatCurrency(person.monthlyFee)}
                  </TableCell>
                  <TableCell>
                    {person.active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Link href={`/people/${person.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-slate-600 hover:text-teal-800"
                          title="View Details & History"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPerson(person)}
                        className="h-8 px-2 text-slate-600 hover:text-slate-900"
                        title="Edit Information"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>

                      {person.active ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmTogglePerson(person)}
                          className="h-8 px-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50"
                          title="Deactivate Person"
                        >
                          <UserX className="h-3.5 w-3.5 mr-1" />
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmTogglePerson(person)}
                          className="h-8 px-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                          title="Reactivate Person"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Modal */}
      {editingPerson && (
        <EditPersonModal
          person={editingPerson}
          open={!!editingPerson}
          onOpenChange={(open) => !open && setEditingPerson(null)}
        />
      )}

      {/* Confirmation Dialog for Status Toggle */}
      <Dialog
        open={!!confirmTogglePerson}
        onOpenChange={(open) => !open && setConfirmTogglePerson(null)}
        title={
          confirmTogglePerson?.active
            ? `Deactivate ${confirmTogglePerson?.name}?`
            : `Reactivate ${confirmTogglePerson?.name}?`
        }
        description={
          confirmTogglePerson?.active
            ? "Deactivating this person preserves all their past payment records, but excludes them from upcoming monthly expected totals."
            : "Reactivating this person will include them in monthly expected contribution totals."
        }
      >
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => setConfirmTogglePerson(null)}
            disabled={toggling}
          >
            Cancel
          </Button>
          <Button
            variant={confirmTogglePerson?.active ? "danger" : "primary"}
            onClick={handleConfirmStatusToggle}
            disabled={toggling}
          >
            {confirmTogglePerson?.active ? "Yes, Deactivate" : "Yes, Reactivate"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
