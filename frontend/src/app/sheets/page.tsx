'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BookMarked, Layers } from 'lucide-react';
import {
  CardGridSkeleton,
  EmptyState,
  LinkButton,
  PageHeader,
} from '@/components/ui';
import SheetCard from '@/components/SheetCard';

export default function SheetsDirectoryPage() {
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .getSheets()
      .then((data) => setSheets(data || []))
      .catch((error) => {
        console.error(error);
        setFailed(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full flex-1">
      <div className="shell page">
        <PageHeader
          title="SDE sheets"
          sub="Structured paths through the patterns that recur in campus technical rounds — work them in order rather than picking problems at random."
          actions={
            <span className="text-[13px] text-fg-3">
              <span className="font-semibold tabular-nums text-white">{sheets.length}</span> sheets
            </span>
          }
        />

        {loading ? (
          <CardGridSkeleton count={4} className="lg:grid-cols-3 xl:grid-cols-4" />
        ) : failed ? (
          <div className="card">
            <EmptyState
              icon={Layers}
              title="Could not load sheets"
              sub="The API is unreachable. Check that the backend service is running, then reload this page."
            />
          </div>
        ) : sheets.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={BookMarked}
              title="No sheets published yet"
              sub="When a trainer publishes a sheet it will show up here with your progress on it."
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sheets.map((sheet) => (
              <SheetCard key={sheet.id} sheet={sheet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
