"use client";

import { PageHeader } from "@/components/layout/page-header";
import { useI18n } from "@/i18n";
import { Sparkles } from "lucide-react";

export function GamesTitle() {
  const { t } = useI18n();
  return (
    <PageHeader
      title={t("games.title")}
      icon={<Sparkles className="text-purple-500" size={24} />}
    />
  );
}
