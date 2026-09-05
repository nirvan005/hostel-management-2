import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FilePlus2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { currency } from "@/lib/utils";

export interface InvoiceRecord {
  id: string;
  studentName: string;
  semester: string;
  room: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Overdue";
}

export const Route = createFileRoute("/admin/invoices")({
  head: () => ({
    meta: [
      { title: "Invoice Ledger — HostelOS Admin" },
      {
        name: "description",
        content:
          "Track every hostel invoice: amounts, due dates, paid, unpaid and overdue balances by student.",
      },
      { property: "og:title", content: "Invoice Ledger — HostelOS Admin" },
      {
        property: "og:description",
        content: "Semester invoicing ledger with paid, unpaid and overdue tracking.",
      },
    ],
  }),
  component: InvoicesPage,
});

function InvoicesPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [newInvoice, setNewInvoice] = useState({
    student_id: "",
    hostel_id: "",
    amount: 1000,
    due_date: new Date().toISOString().split('T')[0],
    title: "Semester Fee"
  });

  const createInvoice = useMutation({
    mutationFn: async () => {
      await apiClient.post("/invoices", newInvoice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Invoice generated successfully");
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to generate invoice");
    }
  });

  const [bulkInvoice, setBulkInvoice] = useState({
    hostel_id: "",
    amount: 5000,
    due_date: new Date().toISOString().split('T')[0],
    title: "Semester Fee"
  });

  const createBulkInvoice = useMutation({
    mutationFn: async () => {
      await apiClient.post("/invoices/bulk", bulkInvoice);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(res.data?.message || "Bulk invoices generated successfully");
      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to generate bulk invoices");
    }
  });

  const { data: invoicesData = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const res = await apiClient.get('/invoices');
      return res.data.data.invoices.map((i: any) => {
        let statusStr: InvoiceRecord["status"] = "Unpaid";
        if (i.status === "paid") statusStr = "Paid";
        else if (i.status === "pending" && new Date(i.due_date) < new Date()) statusStr = "Overdue";

        return {
          id: i._id.substring(0, 8).toUpperCase(),
          studentName: i.student_id?.user_id?.name || "Unknown",
          semester: i.title || "Fee",
          room: "Unknown", // Assuming room info isn't deeply populated
          amount: i.amount,
          dueDate: new Date(i.due_date).toLocaleDateString(),
          status: statusStr
        } as InvoiceRecord;
      });
    }
  });

  const { data: studentsData = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await apiClient.get('/students');
      return res.data.data.students;
    }
  });

  const { data: hostelsData = [] } = useQuery({
    queryKey: ['hostels'],
    queryFn: async () => {
      const res = await apiClient.get('/hostels');
      return res.data.data.hostels.map((h: any) => h.name) as string[];
    }
  });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoicesData.filter((i: InvoiceRecord) => {
      const matchQ =
        !q ||
        i.studentName.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.semester.toLowerCase().includes(q) ||
        i.room.toLowerCase().includes(q);
      return matchQ && (status === "all" || i.status === status);
    });
  }, [query, status, invoicesData]);

  const totals = {
    billed: invoicesData.reduce((a: number, b: InvoiceRecord) => a + b.amount, 0),
    collected: invoicesData.filter((i: InvoiceRecord) => i.status === "Paid").reduce((a: number, b: InvoiceRecord) => a + b.amount, 0),
    overdue: invoicesData.filter((i: InvoiceRecord) => i.status === "Overdue").reduce((a: number, b: InvoiceRecord) => a + b.amount, 0),
  };

  return (
    <>
      <PageHeader
        title="Invoice ledger"
        subtitle="Semester billing across all hostel blocks"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <FilePlus2 className="size-4" /> Generate invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate invoice</DialogTitle>
                <DialogDescription>
                  Issue a new semester invoice for a resident.
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="single">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="single">Single (Fine/Custom)</TabsTrigger>
                  <TabsTrigger value="bulk">Bulk (Semester/Mess)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="single" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Select 
                      value={newInvoice.student_id} 
                      onValueChange={(val) => setNewInvoice({ ...newInvoice, student_id: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {studentsData.map((s: any) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.user_id?.name || 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <Input 
                        id="amount" 
                        type="number" 
                        value={newInvoice.amount}
                        onChange={(e) => setNewInvoice({ ...newInvoice, amount: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input 
                        id="title" 
                        value={newInvoice.title}
                        onChange={(e) => setNewInvoice({ ...newInvoice, title: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due">Due date</Label>
                    <Input 
                      id="due" 
                      type="date" 
                      value={newInvoice.due_date}
                      onChange={(e) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                    />
                  </div>
                  <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createInvoice.mutate()}
                      disabled={createInvoice.isPending || !newInvoice.student_id}
                    >
                      {createInvoice.isPending ? "Generating..." : "Generate Invoice"}
                    </Button>
                  </DialogFooter>
                </TabsContent>

                <TabsContent value="bulk" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label>Target Hostel</Label>
                    <Select 
                      value={bulkInvoice.hostel_id} 
                      onValueChange={(val) => setBulkInvoice({ ...bulkInvoice, hostel_id: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostelsData.map((h: any, i: number) => (
                          <SelectItem key={i} value={h._id || h}>
                            {h.name || h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bulkAmount">Amount (USD)</Label>
                      <Input 
                        id="bulkAmount" 
                        type="number" 
                        value={bulkInvoice.amount}
                        onChange={(e) => setBulkInvoice({ ...bulkInvoice, amount: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bulkTitle">Title</Label>
                      <Input 
                        id="bulkTitle" 
                        value={bulkInvoice.title}
                        onChange={(e) => setBulkInvoice({ ...bulkInvoice, title: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulkDue">Due date</Label>
                    <Input 
                      id="bulkDue" 
                      type="date" 
                      value={bulkInvoice.due_date}
                      onChange={(e) => setBulkInvoice({ ...bulkInvoice, due_date: e.target.value })}
                    />
                  </div>
                  <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createBulkInvoice.mutate()}
                      disabled={createBulkInvoice.isPending || !bulkInvoice.hostel_id}
                    >
                      {createBulkInvoice.isPending ? "Generating..." : "Generate Bulk"}
                    </Button>
                  </DialogFooter>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total billed", value: totals.billed },
          { label: "Collected", value: totals.collected },
          { label: "Overdue", value: totals.overdue },
        ].map((t) => (
          <div key={t.label} className="glass-panel rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">{t.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{currency(t.value)}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search invoice, student or room"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="hidden md:table-cell">Room</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden lg:table-cell">Due date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : null}
            {rows.map((i: InvoiceRecord) => (
              <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs">{i.id}</TableCell>
                  <TableCell>
                    <p className="font-medium">{i.studentName}</p>
                    <p className="text-xs text-muted-foreground">{i.semester}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{i.room}</TableCell>
                  <TableCell className="font-medium">{currency(i.amount)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{i.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={i.status} />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No invoices match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
