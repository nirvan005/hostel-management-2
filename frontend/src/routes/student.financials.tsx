import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Download, Receipt, ShieldCheck } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { currency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface StudentInvoice {
  id: string;
  semester: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Overdue";
  breakdown: Array<{ label: string; amount: number }>;
}

export const Route = createFileRoute("/student/financials")({
  head: () => ({
    meta: [
      { title: "Financials — HostelOS Student Portal" },
      {
        name: "description",
        content: "View your semester hostel invoice, fee breakdown, due date and payment history.",
      },
      { property: "og:title", content: "Financials — HostelOS" },
      { property: "og:description", content: "Semester hostel fees, due dates and payments." },
    ],
  }),
  component: Financials,
});

function Financials() {
  const queryClient = useQueryClient();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${activeInvoice?.id || 'Download'}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error("Failed to generate PDF");
    }
  };

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: async () => {
      const res = await apiClient.get('/invoices');
      return res.data.data.invoices.map((i: any) => {
        let statusStr: StudentInvoice["status"] = "Unpaid";
        if (i.status === "paid") statusStr = "Paid";
        else if (i.status === "pending" && new Date(i.due_date) < new Date()) statusStr = "Overdue";

        return {
          id: i._id.substring(0, 8).toUpperCase(),
          realId: i._id,
          semester: i.title || "Fee",
          amount: i.amount,
          dueDate: new Date(i.due_date).toLocaleDateString(),
          status: statusStr,
          breakdown: i.items || [{ label: "Hostel Fee", amount: i.amount }]
        } as StudentInvoice & { realId: string };
      });
    }
  });

  const payInvoice = useMutation({
    mutationFn: async (invoiceId: string) => {
      await apiClient.post(`/invoices/${invoiceId}/pay`, {
        amount_paid: invoices.find((i: any) => i.realId === invoiceId)?.amount || 0,
        payment_method: 'card',
        reference_id: 'txn_' + Math.random().toString(36).substr(2, 9)
      });
    },
    onSuccess: () => {
      setIsProcessing(false);
      setCheckoutOpen(false);
      toast.success("Payment successful!");
      queryClient.invalidateQueries({ queryKey: ['my-invoices'] });
    },
    onError: () => {
      setIsProcessing(false);
      toast.error("Payment failed. Please try again.");
    }
  });

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    // Simulate Razorpay network delay
    setTimeout(() => {
      if (activeInvoice) {
        payInvoice.mutate(activeInvoice.realId);
      }
    }, 2000);
  };

  const sortedInvoices = [...invoices].sort((a: any, b: any) => 
    new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );

  const activeInvoice = selectedInvoiceId 
    ? sortedInvoices.find((i: any) => i.id === selectedInvoiceId) 
    : (sortedInvoices.find((i: any) => i.status !== "Paid") || sortedInvoices[0]);

  return (
    <>
      <PageHeader title="Financials" subtitle="Semester fees, invoices and payments" />
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="glass-panel rounded-2xl p-6 lg:col-span-3">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading financials...</div>
          ) : !activeInvoice ? (
            <div className="p-8 text-center text-muted-foreground">No invoices found.</div>
          ) : (
            <>
              <div ref={invoiceRef} className="bg-card p-4 rounded-xl -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{activeInvoice.semester} invoice</p>
                    <p className="font-display text-4xl font-semibold">
                      {currency(activeInvoice.amount)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Due {activeInvoice.dueDate} · {activeInvoice.id}
                    </p>
                  </div>
                  <StatusBadge status={activeInvoice.status} />
                </div>

                <ul className="mt-6 divide-y divide-border rounded-xl bg-muted/50 px-4">
                  {activeInvoice.breakdown.map((b: any) => (
                    <li key={b.label} className="flex items-center justify-between py-3 text-sm">
                      <span className="text-muted-foreground">{b.label}</span>
                      <span className="font-medium">{currency(b.amount)}</span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between py-3 text-sm font-semibold">
                    <span>Total due</span>
                    <span>{currency(activeInvoice.amount)}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {activeInvoice.status !== "Paid" && (
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Pay now · {currency(activeInvoice.amount)}
                  </Button>
                )}
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleDownloadPDF}
                  >
                    <Download className="size-4" /> PDF
                  </Button>
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5" /> Payments are processed by the university bursar.
              </p>
            </>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Receipt className="size-4 text-primary" /> Payment history
          </h3>
          <ul className="mt-4 space-y-3">
            {sortedInvoices.map((i: any) => (
              <li
                key={i.id}
                onClick={() => setSelectedInvoiceId(i.id)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border/70 p-3 transition-colors ${activeInvoice?.id === i.id ? 'bg-primary/5 border-primary/30' : 'bg-card/60 hover:bg-card'}`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{i.semester}</p>
                  <p className="text-xs text-muted-foreground">{i.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{currency(i.amount)}</p>
                  <StatusBadge status={i.status} className="mt-1" />
                </div>
              </li>
            ))}
            {sortedInvoices.length === 0 && !isLoading && (
              <p className="text-xs text-muted-foreground text-center py-4">No payment history.</p>
            )}
          </ul>
        </div>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Secure Checkout</DialogTitle>
            <DialogDescription>
              Complete your payment for {activeInvoice?.semester}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-xl border p-4 bg-muted/20 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Total Payable</p>
                <p className="text-xs text-muted-foreground">Order ID: txn_{Math.random().toString(36).substr(2, 6)}</p>
              </div>
              <p className="font-display text-xl font-bold">{activeInvoice && currency(activeInvoice.amount)}</p>
            </div>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Card Number</Label>
                <Input placeholder="0000 0000 0000 0000" disabled={isProcessing} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input placeholder="MM/YY" disabled={isProcessing} />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input placeholder="123" type="password" disabled={isProcessing} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full" size="lg" onClick={handleSimulatePayment} disabled={isProcessing}>
              {isProcessing ? "Processing Payment..." : `Pay ${activeInvoice && currency(activeInvoice.amount)}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
