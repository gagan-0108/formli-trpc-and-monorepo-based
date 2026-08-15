"use client";

import { useState } from "react";
import { trpc } from "~/trpc/client";
import { useAuth } from "~/providers/auth-provider";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { TEMPLATES } from "~/lib/constants";
import { resolveCardHeaderStyles, Theme } from "~/lib/theme";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  BarChart3,
  Loader2,
  ArrowRight,
  Edit3,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "~/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const utils = trpc.useUtils();
  const [isCreating, setIsCreating] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  const { data: forms, isLoading: isFormsLoading } = trpc.form.list.useQuery(undefined);
  const { data: themes } = trpc.theme.list.useQuery(undefined);

  const createFormMutation = trpc.form.create.useMutation({
    onSuccess: (data) => {
      toast.success("Form created successfully");
      router.push(`/forms/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create form");
      setIsCreating(false);
    },
  });

  const deleteFormMutation = trpc.form.delete.useMutation({
    onSuccess: () => {
      toast.success("Form deleted");
      utils.form.list.invalidate();
      setFormToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete form");
    },
  });

  const handleCreateForm = async () => {
    setIsCreating(true);
    createFormMutation.mutate({
      title: "Untitled Form",
      description: "",
    });
  };

  const handleDeleteForm = (id: string) => {
    deleteFormMutation.mutate({ formId: id });
  };

  const getThemeForForm = (themeId: string | null) => {
    if (!themeId || !themes) return null;
    return themes.find((t) => t.id === themeId) as Theme | undefined;
  };

  const totalForms = forms?.length || 0;
  const totalResponses = forms?.reduce((acc, form) => acc + (form.responseCount || 0), 0) || 0;
  const publishedForms = forms?.filter((form) => form.status === "published").length || 0;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-zinc-400">
            Welcome back. Here's an overview of your forms.
          </p>
        </div>
        <Button
          onClick={handleCreateForm}
          disabled={isCreating}
          className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 shadow-lg shadow-indigo-500/20"
        >
          {isCreating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Form
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0f] p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Forms</p>
              <h3 className="text-2xl font-bold text-white">{totalForms}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0f] p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Responses</p>
              <h3 className="text-2xl font-bold text-white">{totalResponses}</h3>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#0c0c0f] p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Eye className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Published Forms</p>
              <h3 className="text-2xl font-bold text-white">{publishedForms}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Forms List */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Your Forms</h2>
        </div>

        {isFormsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0c0c0f] overflow-hidden">
                <Skeleton className="h-3 w-full bg-white/[0.02]" />
                <div className="p-5">
                  <Skeleton className="h-6 w-3/4 mb-3 bg-white/[0.05]" />
                  <Skeleton className="h-4 w-full mb-2 bg-white/[0.05]" />
                  <Skeleton className="h-4 w-2/3 mb-6 bg-white/[0.05]" />
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.06]">
                    <Skeleton className="h-8 w-20 bg-white/[0.05]" />
                    <Skeleton className="h-8 w-8 rounded-full bg-white/[0.05]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : forms && forms.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => {
              const theme = getThemeForForm(form.themeId);
              const headerStyles = theme ? resolveCardHeaderStyles(theme) : { backgroundColor: "#6366f1" };

              return (
                <div
                  key={form.id}
                  className="group relative flex flex-col rounded-xl border border-white/[0.06] bg-[#0c0c0f] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/50"
                >
                  <div 
                    className="h-3 w-full" 
                    style={headerStyles as any} 
                  />
                  
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white text-lg line-clamp-1">
                        {form.title}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          form.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        )}
                      >
                        {form.status.toLowerCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-4 flex-1">
                      {form.description || "No description provided."}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>{form.responseCount || 0} responses</span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <Link href={`/forms/${form.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-3 text-zinc-300 hover:text-white hover:bg-white/[0.06]">
                            <Edit3 className="mr-2 h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {form.status === "published" && (
                          <Link href={`/f/${form.slug}`} target="_blank">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/[0.06]" title="Open public link">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Link href={`/forms/${form.id}/responses`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/[0.06]" title="View responses">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" title="Delete form" onClick={() => setFormToDelete(form.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#0c0c0f] border-white/[0.06] text-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription className="text-zinc-400">
                                This action cannot be undone. This will permanently delete your
                                form "{form.title}" and remove all of its data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-white/[0.06] text-white hover:bg-white/[0.03] hover:text-white">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteForm(form.id)}
                                className="bg-red-500 text-white hover:bg-red-600"
                              >
                                {deleteFormMutation.isPending && formToDelete === form.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-[#0c0c0f]/50 py-16 text-center">
            <div className="mb-4 rounded-full bg-white/[0.03] p-4">
              <FileText className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">No forms yet</h3>
            <p className="mb-6 max-w-sm text-zinc-400">
              Create your first form to start collecting responses from your users.
            </p>
            <Button
              onClick={handleCreateForm}
              disabled={isCreating}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create your first form
            </Button>
          </div>
        )}
      </div>

      {/* Quick Start Templates */}
      <div className="pt-6 border-t border-white/[0.06]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Quick Start Templates</h2>
            <p className="text-sm text-zinc-400 mt-1">Start with a pre-built template</p>
          </div>
          <Link href="/explore" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES?.slice(0, 4).map((template: any) => (
            <div
              key={template.id}
              className="group cursor-pointer rounded-xl border border-white/[0.06] bg-[#0c0c0f] p-4 transition-all hover:border-white/[0.12] hover:bg-white/[0.02]"
              onClick={() => {
                toast.info("Template integration coming soon");
              }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="font-medium text-white">{template.name}</h4>
              <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
