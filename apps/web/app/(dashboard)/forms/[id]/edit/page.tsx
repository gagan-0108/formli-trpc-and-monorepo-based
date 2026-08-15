"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/switch";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  Copy,
  Settings,
  Loader2,
  CheckCircle2,
  BarChart3,
  Sparkles,
  Heart,
  Palette,
  Type,
  CopyPlus,
} from "lucide-react";
import { toast } from "sonner";

import { FIELD_TYPES, getFieldType } from "~/lib/constants";
import type { Theme } from "~/lib/theme";
import { LivePreview } from "./_components/live-preview";
import { ThemeDropdown } from "./_components/theme-dropdown";
import { OptionsEditor } from "./_components/options-editor";

type EditorTab = "fields" | "design" | "settings";

// ─── Page ─────────────────────────────────────────────────────
export default function FormEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  // ─── Data Fetching ──────────────────────────────────────
  const { data: form, isLoading } = trpc.form.getById.useQuery({ formId: id });
  const { data: themes } = trpc.theme.list.useQuery(undefined);

  // ─── Mutations ──────────────────────────────────────────
  const updateForm = trpc.form.update.useMutation({
    onSuccess: () => { utils.form.getById.invalidate({ formId: id }); toast.success("Saved"); },
    onError: (err) => toast.error(err.message),
  });

  const publishForm = trpc.form.publish.useMutation({
    onSuccess: () => { utils.form.getById.invalidate({ formId: id }); toast.success("Form published!"); },
    onError: (err) => toast.error(err.message),
  });

  const unpublishForm = trpc.form.unpublish.useMutation({
    onSuccess: () => { utils.form.getById.invalidate({ formId: id }); toast.success("Form unpublished"); },
    onError: (err) => toast.error(err.message),
  });

  const addField = trpc.field.add.useMutation({
    onSuccess: () => utils.form.getById.invalidate({ formId: id }),
    onError: (err) => toast.error(err.message),
  });

  const updateField = trpc.field.update.useMutation({
    onSuccess: () => utils.form.getById.invalidate({ formId: id }),
    onError: (err) => toast.error(err.message),
  });

  const deleteField = trpc.field.delete.useMutation({
    onSuccess: () => { utils.form.getById.invalidate({ formId: id }); setSelectedFieldId(null); },
    onError: (err) => toast.error(err.message),
  });

  const reorderFields = trpc.field.reorder.useMutation({
    onSuccess: () => utils.form.getById.invalidate({ formId: id }),
    onError: (err) => toast.error(err.message),
  });

  // ─── Local State ────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<EditorTab>("fields");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [themeId, setThemeId] = useState<string | null>(null);

  // Welcome screen
  const [welcomeTitle, setWelcomeTitle] = useState("");
  const [welcomeDescription, setWelcomeDescription] = useState("");
  const [welcomeButtonText, setWelcomeButtonText] = useState("Start");

  // Ending screen
  const [thankYouTitle, setThankYouTitle] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [thankYouButtonText, setThankYouButtonText] = useState("");
  const [thankYouButtonUrl, setThankYouButtonUrl] = useState("");

  // Settings
  const [collectEmail, setCollectEmail] = useState(false);
  const [closeMessage, setCloseMessage] = useState("");
  const [maxResponses, setMaxResponses] = useState("");

  // Sync from server
  useEffect(() => {
    if (!form) return;
    setTitle(form.title);
    setDescription(form.description || "");
    setVisibility(form.visibility);
    setThemeId(form.themeId);
    setWelcomeTitle(form.welcomeTitle || "");
    setWelcomeDescription(form.welcomeDescription || "");
    setWelcomeButtonText(form.welcomeButtonText || "Start");
    setThankYouTitle(form.thankYouTitle || "");
    setThankYouMessage(form.thankYouMessage || "");
    setThankYouButtonText(form.thankYouButtonText || "");
    setThankYouButtonUrl(form.thankYouButtonUrl || "");
    setCollectEmail(form.collectEmail || false);
    setCloseMessage(form.closeMessage || "");
    setMaxResponses(form.maxResponses ? String(form.maxResponses) : "");
  }, [form]);

  const selectedField = form?.fields?.find((f) => f.id === selectedFieldId);

  // ─── Handlers ───────────────────────────────────────────
  const handleSave = () => {
    updateForm.mutate({
      formId: id,
      title,
      description,
      visibility,
      themeId,
      welcomeTitle: welcomeTitle || null,
      welcomeDescription: welcomeDescription || null,
      welcomeButtonText: welcomeButtonText || null,
      thankYouTitle: thankYouTitle || null,
      thankYouMessage: thankYouMessage || null,
      thankYouButtonText: thankYouButtonText || null,
      thankYouButtonUrl: thankYouButtonUrl || null,
      collectEmail,
      closeMessage: closeMessage || null,
      maxResponses: maxResponses ? parseInt(maxResponses) : null,
    });
  };

  const handleAddField = (type: string) => {
    const fieldDef = getFieldType(type);
    addField.mutate({
      formId: id,
      type: type as any,
      label: fieldDef?.label || "New Field",
      required: false,
    });
  };

  const handleDuplicateField = (field: { type: string; label: string; required: boolean; placeholder?: string | null; description?: string | null; options?: Array<{ label: string; value: string }> | null }) => {
    addField.mutate({
      formId: id,
      type: field.type as any,
      label: `${field.label} (copy)`,
      required: field.required,
      placeholder: field.placeholder ?? undefined,
      description: field.description ?? undefined,
      options: field.options ?? undefined,
    });
  };

  const handleMoveField = (fieldId: string, direction: "up" | "down") => {
    if (!form?.fields) return;
    const fields = [...form.fields];
    const idx = fields.findIndex((f) => f.id === fieldId);
    if (direction === "up" && idx > 0) {
      const temp = fields[idx - 1]!;
      fields[idx - 1] = fields[idx]!;
      fields[idx] = temp;
    } else if (direction === "down" && idx < fields.length - 1) {
      const temp = fields[idx + 1]!;
      fields[idx + 1] = fields[idx]!;
      fields[idx] = temp;
    }
    reorderFields.mutate({ formId: id, fieldIds: fields.map((f) => f.id) });
  };

  const handleCopyLink = () => {
    if (form?.slug) {
      navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`);
      toast.success("Link copied!");
    }
  };

  // ─── Loading / Not Found ────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-8 p-6 page-enter max-w-7xl mx-auto">
        <Skeleton className="h-12 w-64 bg-zinc-900 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl bg-zinc-900" />
            ))}
          </div>
          <Skeleton className="h-[600px] rounded-[2.5rem] bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-20 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <Settings className="w-8 h-8 text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Form not found</h2>
        <p className="text-zinc-500 mb-6 max-w-sm">The form you are looking for doesn't exist or you don't have permission to access it.</p>
        <Button onClick={() => router.push("/dashboard")} className="bg-indigo-600 hover:bg-indigo-700">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────────
  return (
    <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col min-h-screen">
      
      {/* ===== TOP BAR ===== */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="w-10 h-10 rounded-full bg-zinc-900 border border-white/[0.05] hover:bg-zinc-800">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold truncate max-w-[300px] md:max-w-[400px] text-white">{form.title}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <Badge 
                variant="outline" 
                className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border ${form.status === "published" ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-zinc-700 text-zinc-400 bg-zinc-900"}`}
              >
                {form.status}
              </Badge>
              {form.status === "published" && (
                <button onClick={handleCopyLink} className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-indigo-400 transition-colors bg-white/[0.03] px-2 py-1 rounded-md border border-white/[0.05]">
                  <Copy className="w-3 h-3" />
                  /f/{form.slug}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <ThemeDropdown themes={themes as Theme[] | undefined} themeId={themeId} setThemeId={setThemeId} />

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowPreview(!showPreview)} 
            className="border-white/[0.06] bg-[#0f0f12] text-zinc-300 hidden lg:flex h-9 rounded-lg hover:bg-white/[0.02]"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2 text-zinc-400" /> : <Eye className="w-4 h-4 mr-2 text-zinc-400" />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>

          <div className="h-6 w-px bg-white/[0.08] hidden md:block mx-1"></div>

          {form.status === "published" && (
            <>
              <Button variant="ghost" size="sm" onClick={() => window.open(`/f/${form.slug}`, "_blank")} className="text-zinc-300 hover:text-white h-9">
                <ExternalLink className="w-4 h-4 mr-2" /> Open
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push(`/forms/${id}/responses`)} className="text-zinc-300 hover:text-white h-9">
                <BarChart3 className="w-4 h-4 mr-2" /> Responses
                {form.responseCount ? <span className="ml-1.5 bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{form.responseCount}</span> : null}
              </Button>
            </>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave} 
            disabled={updateForm.isPending}
            className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200 h-9 rounded-lg"
          >
            {updateForm.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>

          {form.status === "published" ? (
            <Button variant="secondary" size="sm" onClick={() => unpublishForm.mutate({ formId: id })} disabled={unpublishForm.isPending} className="h-9 rounded-lg font-medium">
              Unpublish
            </Button>
          ) : (
            <Button 
              size="sm" 
              onClick={() => publishForm.mutate({ formId: id })} 
              disabled={publishForm.isPending}
              className="h-9 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white border-0 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]"
            >
              {publishForm.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Publish
            </Button>
          )}
        </div>
      </div>

      {/* ===== TAB SWITCHER (Pills) ===== */}
      <div className="flex items-center gap-2 mb-8 bg-[#0f0f12] border border-white/[0.06] p-1.5 rounded-xl self-start">
        {([
          { key: "fields" as EditorTab, label: "Questions", icon: Type },
          { key: "design" as EditorTab, label: "Design", icon: Palette },
          { key: "settings" as EditorTab, label: "Settings", icon: Settings },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key 
                ? "bg-zinc-800/80 text-white shadow-sm" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.key ? "text-indigo-400" : "text-zinc-500"}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== SPLIT PANE ===== */}
      <div className="flex gap-8 flex-1">
        
        {/* LEFT: Editor panel */}
        <div className={`flex-1 min-w-0 pb-20 ${showPreview ? "lg:max-w-[calc(100%-380px)]" : "max-w-4xl"}`}>

          {/* ===== FIELDS TAB ===== */}
          {activeTab === "fields" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Left: Fields List */}
              <div className="xl:col-span-7 space-y-5">
                
                {/* Form Title & Description */}
                <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/50" />
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Form Title"
                    className="text-2xl font-bold border-none bg-transparent px-0 focus-visible:ring-0 h-auto placeholder:text-zinc-700"
                  />
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description to tell people what this form is about (optional)"
                    className="border-none bg-transparent px-0 focus-visible:ring-0 resize-none min-h-[60px] text-zinc-400 mt-2 text-base placeholder:text-zinc-700"
                    rows={2}
                  />
                </div>

                {/* Fields List */}
                <div className="space-y-4 mt-8">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px bg-white/[0.06] flex-1"></div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Questions</span>
                    <div className="h-px bg-white/[0.06] flex-1"></div>
                  </div>
                  
                  {form.fields?.map((field, index) => {
                    const fieldDef = getFieldType(field.type);
                    const Icon = fieldDef?.icon || Type;
                    const isSelected = selectedFieldId === field.id;
                    
                    return (
                      <div
                        key={field.id}
                        className={`rounded-xl border p-5 flex items-start gap-4 cursor-pointer transition-all group relative overflow-hidden ${
                          isSelected 
                            ? "border-indigo-500/40 bg-indigo-500/[0.03] shadow-[0_0_15px_rgba(99,102,241,0.05)]" 
                            : "border-white/[0.06] bg-[#0f0f12] hover:border-white/[0.12] hover:bg-white/[0.01]"
                        }`}
                        onClick={() => setSelectedFieldId(field.id)}
                      >
                        {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl" />}
                        
                        <div className="flex flex-col items-center gap-1.5 pt-1 text-zinc-600 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); handleMoveField(field.id, "up"); }} disabled={index === 0} className="hover:text-white disabled:opacity-30 p-1">
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <GripVertical className="w-4 h-4" />
                          <button onClick={(e) => { e.stopPropagation(); handleMoveField(field.id, "down"); }} disabled={index === (form.fields?.length || 0) - 1} className="hover:text-white disabled:opacity-30 p-1">
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <span className="text-xs font-bold text-zinc-600 bg-zinc-900 w-6 h-6 rounded flex items-center justify-center">{index + 1}</span>
                            <div className="p-1.5 bg-white/[0.04] rounded-md border border-white/[0.05]">
                              <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-400" : "text-zinc-400"}`} />
                            </div>
                            <span className={`font-semibold text-base truncate ${isSelected ? "text-indigo-100" : "text-zinc-200"}`}>{field.label}</span>
                            {field.required && <span className="text-red-400/80 text-sm font-bold">*</span>}
                          </div>
                          <p className="text-sm text-zinc-500 ml-11 font-medium">{fieldDef?.label}</p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1 rounded-lg border border-white/[0.05]">
                          <button onClick={(e) => { e.stopPropagation(); handleDuplicateField(field); }} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors" title="Duplicate">
                            <CopyPlus className="w-4 h-4" />
                          </button>
                          <div className="w-px h-4 bg-white/10"></div>
                          <button onClick={(e) => { e.stopPropagation(); deleteField.mutate({ fieldId: field.id }); }} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add field area */}
                <div className="rounded-xl border border-dashed border-zinc-700 bg-black/20 p-6 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                      <Plus className="w-4 h-4 text-zinc-400" />
                    </div>
                    <h3 className="font-semibold text-sm text-zinc-300">Add Question</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {FIELD_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant="outline"
                        className="h-10 justify-start px-3 bg-[#0f0f12] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1] text-zinc-400 hover:text-zinc-200 font-medium transition-all"
                        onClick={() => handleAddField(type.value)}
                      >
                        <type.icon className="w-4 h-4 mr-2.5 text-zinc-500" />
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Field config sidebar */}
              <div className="xl:col-span-5">
                <div className="sticky top-24">
                  {selectedField ? (
                    <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] shadow-xl overflow-hidden">
                      <div className="border-b border-white/[0.06] bg-black/20 px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                          <h3 className="font-semibold text-sm">Field Configuration</h3>
                        </div>
                        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-xs font-mono">
                          {selectedField.type}
                        </Badge>
                      </div>

                      <div className="p-5 space-y-6">
                        <div className="space-y-2.5">
                          <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Question Text</Label>
                          <Input
                            value={selectedField.label}
                            onChange={(e) => updateField.mutate({ fieldId: selectedField.id, label: e.target.value })}
                            className="bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50 h-10 text-base"
                          />
                        </div>

                        <div className="space-y-2.5">
                          <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Placeholder</Label>
                          <Input
                            value={selectedField.placeholder || ""}
                            onChange={(e) => updateField.mutate({ fieldId: selectedField.id, placeholder: e.target.value || null })}
                            placeholder="e.g. Type your answer here..."
                            className="bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50 h-10 text-sm"
                          />
                        </div>

                        <div className="space-y-2.5">
                          <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description (Optional)</Label>
                          <Textarea
                            value={selectedField.description || ""}
                            onChange={(e) => updateField.mutate({ fieldId: selectedField.id, description: e.target.value || null })}
                            placeholder="Add clarifying details for respondents..."
                            rows={3}
                            className="bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500/50 resize-none text-sm"
                          />
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-lg border border-white/[0.04] bg-white/[0.01]">
                          <div>
                            <Label className="text-sm font-semibold text-zinc-200">Required Field</Label>
                            <p className="text-xs text-zinc-500 mt-0.5">User must answer to submit</p>
                          </div>
                          <Switch
                            checked={selectedField.required}
                            onCheckedChange={(checked) => updateField.mutate({ fieldId: selectedField.id, required: checked })}
                            className="data-[state=checked]:bg-indigo-500"
                          />
                        </div>

                        {(selectedField.type === "single_select" || selectedField.type === "multi_select") && (
                          <div className="pt-4 border-t border-white/[0.06]">
                            <OptionsEditor
                              options={selectedField.options || []}
                              onChange={(options) => updateField.mutate({ fieldId: selectedField.id, options })}
                            />
                          </div>
                        )}
                        
                        <div className="pt-4 border-t border-white/[0.06] flex justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteField.mutate({ fieldId: selectedField.id })}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Field
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-zinc-800 bg-[#0c0c0f]/50 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                      <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                        <Settings className="w-8 h-8 text-zinc-600" />
                      </div>
                      <h3 className="font-semibold text-lg text-zinc-300 mb-2">No Field Selected</h3>
                      <p className="text-sm text-zinc-500 max-w-[200px]">Click on a question card from the left panel to edit its configuration.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== DESIGN TAB ===== */}
          {activeTab === "design" && (
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Form Design</h2>
                <p className="text-zinc-400">Customize how your form looks and feels to respondents.</p>
              </div>

              {/* Welcome Screen */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] overflow-hidden">
                <div className="border-b border-white/[0.06] bg-black/20 p-5 flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-zinc-200">Welcome Screen</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">The first thing respondents see before starting.</p>
                  </div>
                </div>
                
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Heading</Label>
                    <Input 
                      value={welcomeTitle} 
                      onChange={(e) => setWelcomeTitle(e.target.value)} 
                      placeholder="e.g. Let's get to know you" 
                      className="bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 text-base h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Description</Label>
                    <Textarea 
                      value={welcomeDescription} 
                      onChange={(e) => setWelcomeDescription(e.target.value)} 
                      placeholder="Add a brief introduction..." 
                      rows={3} 
                      className="bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 resize-none" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Button Text</Label>
                    <Input 
                      value={welcomeButtonText} 
                      onChange={(e) => setWelcomeButtonText(e.target.value)} 
                      placeholder="Start" 
                      className="bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 max-w-[240px]" 
                    />
                  </div>
                </div>
              </div>

              {/* Ending Screen */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] overflow-hidden">
                <div className="border-b border-white/[0.06] bg-black/20 p-5 flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-zinc-200">Ending Screen</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Shown immediately after someone submits.</p>
                  </div>
                </div>
                
                <div className="p-6 space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Thank You Heading</Label>
                    <Input 
                      value={thankYouTitle} 
                      onChange={(e) => setThankYouTitle(e.target.value)} 
                      placeholder="e.g. Thanks for participating!" 
                      className="bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 text-base h-11" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Thank You Message</Label>
                    <Textarea 
                      value={thankYouMessage} 
                      onChange={(e) => setThankYouMessage(e.target.value)} 
                      placeholder="Your response means a lot to us." 
                      rows={3} 
                      className="bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 resize-none" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Call-to-Action Button</Label>
                      <Input 
                        value={thankYouButtonText} 
                        onChange={(e) => setThankYouButtonText(e.target.value)} 
                        placeholder="e.g. Visit our website" 
                        className="bg-black/40 border-white/[0.06]" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Destination URL</Label>
                      <Input 
                        value={thankYouButtonUrl} 
                        onChange={(e) => setThankYouButtonUrl(e.target.value)} 
                        placeholder="https://..." 
                        className="bg-black/40 border-white/[0.06]" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-base text-zinc-200 mb-1">Form Visibility</h3>
                  <p className="text-sm text-zinc-500">Control how people can find your form.</p>
                </div>
                <Select value={visibility} onValueChange={(v: "public" | "unlisted") => setVisibility(v)}>
                  <SelectTrigger className="bg-black/40 border-white/[0.06] w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="public">🌍 Public (Explore)</SelectItem>
                    <SelectItem value="unlisted">🔗 Unlisted (Link only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={updateForm.isPending} 
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white border-0 shadow-[0_0_15px_rgba(99,102,241,0.2)] h-11 px-8 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                >
                  {updateForm.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Save Design
                </Button>
              </div>
            </div>
          )}

          {/* ===== SETTINGS TAB ===== */}
          {activeTab === "settings" && (
            <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Form Settings</h2>
                <p className="text-zinc-400">Configure access, notifications, and constraints.</p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-6 hover:border-white/[0.1] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="pr-8">
                    <h3 className="font-semibold text-base text-zinc-200 mb-1">Collect Email Addresses</h3>
                    <p className="text-sm text-zinc-500">Require respondents to enter their email before they can start the form.</p>
                  </div>
                  <Switch 
                    checked={collectEmail} 
                    onCheckedChange={setCollectEmail} 
                    className="data-[state=checked]:bg-indigo-500 scale-110"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-6 hover:border-white/[0.1] transition-colors space-y-4">
                <div>
                  <h3 className="font-semibold text-base text-zinc-200 mb-1">Response Limit</h3>
                  <p className="text-sm text-zinc-500">Automatically close the form after receiving this many responses.</p>
                </div>
                <Input 
                  type="number" 
                  value={maxResponses} 
                  onChange={(e) => setMaxResponses(e.target.value)} 
                  placeholder="e.g. 100 (Leave empty for unlimited)" 
                  className="bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 max-w-[300px]" 
                />
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0f0f12] p-6 hover:border-white/[0.1] transition-colors space-y-4">
                <div>
                  <h3 className="font-semibold text-base text-zinc-200 mb-1">Closed Form Message</h3>
                  <p className="text-sm text-zinc-500">What respondents see if the form is manually closed or hits the response limit.</p>
                </div>
                <Textarea 
                  value={closeMessage} 
                  onChange={(e) => setCloseMessage(e.target.value)} 
                  placeholder="This form is no longer accepting responses." 
                  rows={3} 
                  className="bg-black/40 border-white/[0.06] focus-visible:ring-indigo-500/30 resize-none" 
                />
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  onClick={handleSave} 
                  disabled={updateForm.isPending} 
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white border-0 shadow-[0_0_15px_rgba(99,102,241,0.2)] h-11 px-8 rounded-full text-base font-semibold transition-all hover:scale-[1.02]"
                >
                  {updateForm.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                  Save Settings
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Live Preview */}
        {showPreview && (
          <div className="hidden lg:block sticky top-8 self-start xl:pl-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <LivePreview
              form={form}
              themeId={themeId}
              themes={themes as Theme[] | undefined}
              title={title}
              welcomeTitle={welcomeTitle}
              welcomeDescription={welcomeDescription}
              welcomeButtonText={welcomeButtonText}
            />
          </div>
        )}
      </div>
    </div>
  );
}
