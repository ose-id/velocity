import React from 'react';
import { motion } from 'framer-motion';
import StatusCard from '../molecules/StatusCard';
import ActivityLog from '../organisms/ActivityLog';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ActivityPage({ lastResult, logs, onClearLogs }) {
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto custom-scroll">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-lg font-semibold text-neutral-100">{t('activity_page_title')}</h1>
            <p className="text-xs text-neutral-500 mt-1">{t('activity_page_desc')}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <StatusCard lastResult={lastResult} onClearLogs={onClearLogs} />
          <ActivityLog logs={logs} />
        </div>
      </motion.div>
    </div>
  );
}

