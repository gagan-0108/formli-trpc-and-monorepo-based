"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  ArrowLeft,
  Download,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  MessageSquare,
  FileText,
  Clock,
  Eye,
  Activity
} from "lucide-react";
import { toast } from "sonner";

export default function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);

  const { data: form } = trpc.form.getById.useQuery({ formId: id });
  const { data: responsesData, isLoading } = trpc.response.listByForm.useQuery({
    formId: id,
    page,
    limit: 20,
  });
  const exportCSV = trpc.response.exportCSV.useQuery(
    { formId: id },
    { enabled: false }
  );

  const handleExport = async () => {
    try {
      const result = await exportCSV.refetch();
      if (result.data) {
        const blob = new Blob([result.data.csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.data.filename;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("CSV exported successfully");
      }
    } catch (err) {
      toast.error("Failed to export CSV");
    }
  };

  // Helper for pagination numbers
  const totalPages = responsesData?.totalPages || 1;
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          variant={page === i ? "default" : "outline"}
          size="sm"
          className={page === i ? "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent" : "border-white/[0.06] bg-[#0f0f12] text-white hover:bg-white/[0.02]"}
          onClick={() => setPage(i)}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  return (
    <div className="page-enter max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/forms/${id}/edit`)} className="text-muted-foreground hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Editor
          </Button>
          <div className="h-4 w-[1px] bg-white/[0.1] hidden sm:block"></div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{form?.title || "Responses"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/forms/${id}/analytics`)}
            className="border-white/[0.06] bg-[#0f0f12] text-white hover:bg-white/[0.02]"
          >
            <BarChart3 className="w-4 h-4 mr-2 text-indigo-400" />
            Analytics
          </Button>
          <Button 
            size="sm" 
            onClick={handleExport}
            className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20 border-0"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Total Responses</span>
          </div>
          <span className="text-3xl font-bold text-white">{responsesData?.total || 0}</span>
        </div>
        
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Current Page</span>
          </div>
          <span className="text-3xl font-bold text-white">
            {responsesData?.page || 1} <span className="text-xl text-muted-foreground font-normal">/ {responsesData?.totalPages || 1}</span>
          </span>
        </div>
        
        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Form Status</span>
          </div>
          <div>
            <Badge 
              variant={form?.status === "published" ? "default" : "secondary"}
              className={form?.status === "published" ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-0" : "bg-zinc-800/50 text-zinc-400 border-0"}
            >
              {form?.status ? form.status.charAt(0).toUpperCase() + form.status.slice(1) : "Draft"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full rounded-xl bg-[#0f0f12] border border-white/[0.06]" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl bg-[#0f0f12] border border-white/[0.06]" />
          ))}
        </div>
      ) : !responsesData?.responses.length ? (
        <div className="text-center py-24 rounded-xl border border-white/[0.06] bg-[#0f0f12] shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No responses yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Share your form link with users to start collecting responses. They will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent bg-black/20">
                  <TableHead className="w-16 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">#</TableHead>
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</TableHead>
                  {form?.fields?.slice(0, 4).map((field) => (
                    <TableHead key={field.id} className="max-w-[200px] text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {field.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Submitted</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responsesData.responses.map((response, idx) => (
                  <TableRow 
                    key={response.id} 
                    className="border-white/[0.06] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => setSelectedResponse(response)}
                  >
                    <TableCell className="text-center text-muted-foreground font-mono text-sm">
                      {(page - 1) * 20 + idx + 1}
                    </TableCell>
                    <TableCell className="text-sm font-medium text-zinc-200">
                      {response.respondentEmail || <span className="text-muted-foreground italic">Anonymous</span>}
                    </TableCell>
                    {form?.fields?.slice(0, 4).map((field) => {
                      const answer = response.answers.find(
                        (a) => a.fieldId === field.id
                      );
                      return (
                        <TableCell key={field.id} className="text-sm text-zinc-300 max-w-[200px] truncate">
                          {answer?.value || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-sm text-muted-foreground">
                      {response.submittedAt ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(response.submittedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-white/[0.05]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResponse(response);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2">
              <div className="text-sm text-muted-foreground">
                Showing <span className="text-white font-medium">{((page - 1) * 20) + 1}</span> to <span className="text-white font-medium">{Math.min(page * 20, responsesData.total)}</span> of <span className="text-white font-medium">{responsesData.total}</span> responses
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 border-white/[0.06] bg-[#0f0f12] text-white hover:bg-white/[0.02]"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {renderPagination()}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 border-white/[0.06] bg-[#0f0f12] text-white hover:bg-white/[0.02]"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Response Detail Sheet */}
      <Sheet open={!!selectedResponse} onOpenChange={(open) => !open && setSelectedResponse(null)}>
        <SheetContent className="w-full sm:max-w-md border-l border-white/[0.06] bg-[#0f0f12] p-0 shadow-2xl flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-white/[0.06] bg-black/20">
            <SheetTitle className="text-xl text-white">Response Details</SheetTitle>
            <div className="flex flex-col gap-2 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {selectedResponse?.submittedAt
                  ? new Date(selectedResponse.submittedAt).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : "—"}
              </div>
              {selectedResponse?.respondentEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <div className="w-4 h-4 rounded-full bg-indigo-500/20 flex items-center justify-center text-[8px] font-bold text-indigo-400">@</div>
                  <span className="text-white font-medium">{selectedResponse.respondentEmail}</span>
                </div>
              )}
            </div>
          </SheetHeader>
          
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {selectedResponse?.answers.length > 0 ? (
              <div className="space-y-6">
                {selectedResponse.answers.map((answer: any) => (
                  <div key={answer.fieldId} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-300">{answer.fieldLabel}</span>
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground border-white/[0.06] bg-white/[0.02] px-1.5 py-0">
                        {answer.fieldType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-black/20 p-4 text-sm text-white break-words">
                      {answer.value || <span className="text-muted-foreground italic">No answer provided</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-muted-foreground">No answers found in this response.</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
