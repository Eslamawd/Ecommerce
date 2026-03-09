"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FolderTree,
  ImagePlus,
  PencilLine,
  Sparkles,
  Trash2,
  Shapes,
  Film,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useAdminCategories,
  useCreateAdminCategory,
  useDeleteAdminCategory,
  useUpdateAdminCategory,
} from "../../../src/hooks/use-admin";
import { getApiErrorMessages } from "../../../src/lib/api-client";

type CategoryForm = {
  name: string;
  name_en: string;
  description: string;
  description_en: string;
  parent_id: string;
  sort_order: string;
  is_active: boolean;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  name_en: "",
  description: "",
  description_en: "",
  parent_id: "",
  sort_order: "0",
  is_active: true,
};

const sectionVariant = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export default function AdminCategoriesPage() {
  const [form, setForm] = useState<CategoryForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [parentValidationMessage, setParentValidationMessage] = useState<
    string | null
  >(null);
  const [editingMedia, setEditingMedia] = useState<{
    image?: string | null;
    video?: string | null;
  } | null>(null);

  const categoriesQuery = useAdminCategories();
  const createMutation = useCreateAdminCategory();
  const updateMutation = useUpdateAdminCategory();
  const deleteMutation = useDeleteAdminCategory();

  const categories = categoriesQuery.data ?? [];
  const activeCategoriesCount = categories.filter(
    (category) => category.is_active,
  ).length;

  const flattenCategoryTree = (
    tree: typeof categories,
    depth = 0,
  ): Array<(typeof categories)[number] & { depth: number }> => {
    return tree.flatMap((category) => {
      const branch = [{ ...category, depth }];
      if (!category.children?.length) {
        return branch;
      }

      return [...branch, ...flattenCategoryTree(category.children, depth + 1)];
    });
  };

  const flatCategories = flattenCategoryTree(categories);

  const collectDescendantIds = (
    nodes: typeof categories,
    targetId: number,
  ): number[] => {
    const walk = (branch: typeof categories): number[] => {
      for (const node of branch) {
        if (node.id === targetId) {
          const ids: number[] = [];

          const collect = (children: typeof categories) => {
            children.forEach((child) => {
              ids.push(child.id);
              if (child.children?.length) {
                collect(child.children);
              }
            });
          };

          if (node.children?.length) {
            collect(node.children);
          }

          return ids;
        }

        if (node.children?.length) {
          const result = walk(node.children);
          if (result.length) {
            return result;
          }
        }
      }

      return [];
    };

    return walk(nodes);
  };

  const invalidParentIds = useMemo(() => {
    if (!editingId) {
      return new Set<number>();
    }

    return new Set<number>([
      editingId,
      ...collectDescendantIds(categories, editingId),
    ]);
  }, [categories, editingId]);

  const isSelectedParentInvalid =
    Boolean(form.parent_id) && invalidParentIds.has(Number(form.parent_id));

  const selectableParentCategories = useMemo(() => {
    return flatCategories.filter((category) => !invalidParentIds.has(category.id));
  }, [flatCategories, invalidParentIds]);

  const renderCategoryNode = (
    category: (typeof categories)[number],
    depth = 0,
  ) => {
    return (
      <motion.article
        key={category.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        whileHover={{ y: -2 }}
        className="rounded-2xl border border-slate-200/80 bg-card p-4 shadow-soft dark:border-slate-700/70"
        style={{ marginLeft: depth * 16 }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold">{category.name}</h3>
            <p className="text-sm text-muted">Slug: {category.slug}</p>
            <p className="text-xs text-muted">
              Level: {depth + 1}
              {category.parent_id ? ` | Parent #${category.parent_id}` : " | Root"}
            </p>
            {category.children?.length ? (
              <p className="text-xs text-muted">
                Subcategories: {category.children.length}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1 text-sm dark:border-slate-700"
              onClick={() => startEdit(category)}
            >
              <PencilLine className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1 text-sm text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
              onClick={() => remove(category.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>

        {category.children?.length ? (
          <div className="mt-3 space-y-2 border-l border-dashed border-slate-300/80 pl-3 dark:border-slate-700">
            {category.children.map((child) => renderCategoryNode(child, depth + 1))}
          </div>
        ) : null}
      </motion.article>
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSelectedParentInvalid) {
      setParentValidationMessage(
        "Invalid parent: you cannot set the category itself (or one of its children) as parent.",
      );
      toast.error("Invalid parent category selection");
      return;
    }

    const payload = {
      name: form.name,
      name_en: form.name_en,
      description: form.description,
      description_en: form.description_en,
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      sort_order: Number(form.sort_order),
      is_active: form.is_active,
      image: imageFile ?? undefined,
      video: videoFile ?? undefined,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          categoryId: editingId,
          body: payload,
        });
        toast.success("Category updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Category created");
      }

      setEditingId(null);
      setForm(EMPTY_FORM);
      setImageFile(null);
      setVideoFile(null);
      setEditingMedia(null);
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  const startEdit = (category: {
    id: number;
    name: string;
    name_en?: string | null;
    description?: string | null;
    description_en?: string | null;
    image?: string | null;
    video?: string | null;
    parent_id?: number | null;
    sort_order?: number;
    is_active?: boolean;
  }) => {
    setEditingId(category.id);
    setForm({
      name: category.name,
      name_en: category.name_en ?? "",
      description: category.description ?? "",
      description_en: category.description_en ?? "",
      parent_id:
        category.parent_id == null ? "" : String(category.parent_id),
      sort_order: String(category.sort_order ?? 0),
      is_active: Boolean(category.is_active),
    });
    setImageFile(null);
    setVideoFile(null);
    setEditingMedia({ image: category.image, video: category.video });
    setParentValidationMessage(null);
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this category?")) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Category deleted");
      if (editingId === id) {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setImageFile(null);
        setVideoFile(null);
        setEditingMedia(null);
        setParentValidationMessage(null);
      }
    } catch (error) {
      toast.error(getApiErrorMessages(error).join(" | "));
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto min-h-screen w-full max-w-6xl space-y-6 p-6 md:p-10"
    >
      <motion.section
        variants={sectionVariant}
        initial="hidden"
        animate="show"
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-emerald-50 to-teal-100 p-6 shadow-soft dark:border-slate-700/70 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950"
      >
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-emerald-300/40 blur-3xl dark:bg-emerald-700/30" />
        <div className="relative">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
            <Sparkles className="h-3.5 w-3.5" />
            Taxonomy Studio
          </p>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            Category Management
          </h1>
          <p className="mt-1 text-sm text-muted">
            واجهة أنعم لإدارة التصنيفات بهوية بصرية أقوى.
          </p>
        </div>
      </motion.section>

      <motion.section
        variants={sectionVariant}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 gap-3 md:grid-cols-2"
      >
        {[
          { label: "Total Categories", value: categories.length, Icon: Shapes },
          {
            label: "Active Categories",
            value: activeCategoriesCount,
            Icon: FolderTree,
          },
        ].map(({ label, value, Icon }) => (
          <motion.article
            key={label}
            whileHover={{ y: -2, scale: 1.01 }}
            className="rounded-2xl border border-slate-200/80 bg-card p-4 shadow-soft dark:border-slate-700/70"
          >
            <p className="mb-1 text-xs uppercase tracking-[0.2em] text-muted">
              {label}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-black">{value}</p>
              <Icon className="h-5 w-5 text-accent" />
            </div>
          </motion.article>
        ))}
      </motion.section>

      <motion.section
        variants={sectionVariant}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-slate-200/80 bg-card p-4 shadow-soft dark:border-slate-700/70"
      >
        <h2 className="mb-3 text-lg font-semibold">
          {editingId ? `Edit Category #${editingId}` : "Create Category"}
        </h2>

        <form
          onSubmit={submit}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <input
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
          />
          <input
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder="Name EN"
            value={form.name_en}
            onChange={(e) =>
              setForm((p) => ({ ...p, name_en: e.target.value }))
            }
            required
          />
          <textarea
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />
          <textarea
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder="Description EN"
            value={form.description_en}
            onChange={(e) =>
              setForm((p) => ({ ...p, description_en: e.target.value }))
            }
          />

          <select
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            value={form.parent_id}
            onChange={(e) => {
              const nextParent = e.target.value;
              const invalid =
                nextParent !== "" && invalidParentIds.has(Number(nextParent));

              setForm((p) => ({ ...p, parent_id: nextParent }));
              setParentValidationMessage(
                invalid
                  ? "Invalid parent: selected category creates a circular hierarchy."
                  : null,
              );
            }}
          >
            <option value="">No parent (root category)</option>
            {selectableParentCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {`${"  ".repeat(category.depth)}${category.name}`}
              </option>
            ))}
          </select>

          {parentValidationMessage || isSelectedParentInvalid ? (
            <p className="text-xs text-rose-600 dark:text-rose-400 md:col-span-2">
              {parentValidationMessage ??
                "Invalid parent selection. Please choose a different parent category."}
            </p>
          ) : null}

          <input
            type="number"
            className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
            placeholder="Sort Order"
            value={form.sort_order}
            onChange={(e) =>
              setForm((p) => ({ ...p, sort_order: e.target.value }))
            }
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((p) => ({ ...p, is_active: e.target.checked }))
              }
            />
            Active
          </label>

          <div className="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <ImagePlus className="h-3.5 w-3.5" />
                Category image
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold dark:border-slate-700 dark:file:bg-slate-800"
                onChange={(e) =>
                  setImageFile(e.currentTarget.files?.[0] ?? null)
                }
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Film className="h-3.5 w-3.5" />
                Category video
              </span>
              <input
                type="file"
                accept="video/mp4,video/quicktime,video/x-msvideo"
                className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-xs file:font-semibold dark:border-slate-700 dark:file:bg-slate-800"
                onChange={(e) =>
                  setVideoFile(e.currentTarget.files?.[0] ?? null)
                }
              />
            </label>
          </div>

          {editingId && (editingMedia?.image || editingMedia?.video) ? (
            <div className="md:col-span-2 grid grid-cols-1 gap-2 text-xs text-muted md:grid-cols-2">
              <p>Current image: {editingMedia?.image ? "Available" : "-"}</p>
              <p>Current video: {editingMedia?.video ? "Available" : "-"}</p>
            </div>
          ) : null}

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              <PencilLine className="h-4 w-4" />
              {editingId ? "Save" : "Create"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm dark:border-slate-700"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                  setImageFile(null);
                  setVideoFile(null);
                  setEditingMedia(null);
                  setParentValidationMessage(null);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </motion.section>

      {categoriesQuery.isLoading ? (
        <p className="text-sm text-muted">Loading categories...</p>
      ) : null}

      <section className="space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {categories.map((category) => renderCategoryNode(category))}
        </AnimatePresence>

        {categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed border-slate-300/80 bg-card/60 p-8 text-center text-sm text-muted dark:border-slate-700"
          >
            <FolderTree className="mx-auto mb-2 h-5 w-5" />
            No categories yet. Add your first category.
          </motion.div>
        ) : null}
      </section>
    </motion.main>
  );
}
