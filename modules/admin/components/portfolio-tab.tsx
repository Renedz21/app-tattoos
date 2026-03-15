"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/modules/core/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import PortfolioGrid, { type PortfolioItemWithImages } from "./portfolio-grid";
import PortfolioForm from "./portfolio-form";
import PortfolioDeleteDialog from "./portfolio-delete-dialog";

type View = "list" | "create" | "edit";

export default function PortfolioTab() {
  const [items, setItems] = useState<PortfolioItemWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [editItem, setEditItem] = useState<PortfolioItemWithImages | null>(
    null,
  );
  const [deleteItem, setDeleteItem] =
    useState<PortfolioItemWithImages | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/portfolio");
      if (res.ok) {
        setItems(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleEdit = (item: PortfolioItemWithImages) => {
    setEditItem(item);
    setView("edit");
  };

  const handleDelete = (item: PortfolioItemWithImages) => {
    setDeleteItem(item);
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/portfolio/${deleteItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
        setDeleteItem(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaved = () => {
    setView("list");
    setEditItem(null);
    fetchItems();
  };

  const handleCancel = () => {
    setView("list");
    setEditItem(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (view === "create") {
    return <PortfolioForm onSaved={handleSaved} onCancel={handleCancel} />;
  }

  if (view === "edit" && editItem) {
    return (
      <PortfolioForm
        editItem={editItem}
        onSaved={handleSaved}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bebas text-2xl tracking-wide">Portafolio</h2>
        <Button
          onClick={() => setView("create")}
          className="gap-1"
        >
          <Plus size={16} />
          Nuevo trabajo
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground font-grotesk mb-4">
            Aún no hay trabajos en el portafolio.
          </p>
          <Button onClick={() => setView("create")} className="gap-1">
            <Plus size={16} />
            Agregar primer trabajo
          </Button>
        </div>
      ) : (
        <PortfolioGrid
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {deleteItem && (
        <PortfolioDeleteDialog
          title={deleteItem.title}
          isDeleting={isDeleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteItem(null)}
        />
      )}
    </div>
  );
}
