import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCachedStatus, setCachedStatus } from '../../utils/statusCache';

import Tooltip from './Tooltip';

export default function GitHubStatusIndicator({ repo, token }) {
  const { t } = useLanguage();
  const repoUrl = repo?.html_url;

  // Initialize state directly from cache to avoid "blink"
  const [data, setData] = useState(() => {
    if (!repoUrl) return { status: 'neutral', details: [], summary: '', url: null };
    
    const cached = getCachedStatus(repoUrl);
    if (cached) return cached;
    return {
      status: 'loading',
      details: [],
      summary: '',
      url: null
    };
  });

  const { status, details, summary, url } = data;

  useEffect(() => {
    if (!token || !repo || !repoUrl) {
      if (status !== 'neutral') setData(prev => ({ ...prev, status: 'neutral' }));
      return;
    }

    // If we already have data (from cache init), don't fetch again
    if (status !== 'loading') return;

    const owner = repo.owner.login;
    const name = repo.name;
    const defaultBranch = repo.default_branch;

    if (!owner || !name) {
       setData(prev => ({ ...prev, status: 'neutral' }));
      return;
    }

    const fetchStatus = async () => {
      try {
        const octokit = new Octokit({ auth: token });

        // Fetch checks
        const { data: checkRuns } = await octokit.checks.listForRef({
          owner,
          repo: name,
          ref: defaultBranch,
          per_page: 20
        });

        // Fetch legacy status for context
        const { data: legacyStatus } = await octokit.repos.getCombinedStatusForRef({
            owner,
            repo: name,
            ref: defaultBranch
        });


        let finalStatus = 'neutral';
        let checkDetails = [];
        let summaryText = 'ci_no_config';
        let repoActionUrl = '';

        if (checkRuns.total_count > 0) {
          const runs = checkRuns.check_runs;
          const hasFailure = runs.some(run => run.conclusion === 'failure' || run.conclusion === 'timed_out' || run.conclusion === 'cancelled');
          const isRunning = runs.some(run => run.status === 'in_progress' || run.status === 'queued');
          
          if (hasFailure) finalStatus = 'failure';
          else if (isRunning) finalStatus = 'pending';
          else finalStatus = 'success';

          checkDetails = runs.map(run => ({
            name: run.name,
            status: run.conclusion || run.status,
            url: run.html_url,
            id: run.id
          }));
          
          summaryText = hasFailure ? 'ci_checks_failed' : isRunning ? 'ci_checks_running' : 'ci_all_passed';
          repoActionUrl = `${repo.html_url}/actions`;

        } else if (legacyStatus.total_count > 0) {
             finalStatus = legacyStatus.state; // success, failure, pending
             checkDetails = legacyStatus.statuses.map(s => ({
                 name: s.context,
                 status: s.state,
                 url: s.target_url,
                 id: s.id
             }));
             summaryText = finalStatus === 'success' ? 'ci_all_passed' : 'ci_checks_failed';
             repoActionUrl = `${repo.html_url}/commits/${defaultBranch}`;
        }

        const newData = {
          status: finalStatus,
          details: checkDetails,
          summary: summaryText,
          url: repoActionUrl
        };

        // Cache the result
        setCachedStatus(repoUrl, newData);
        setData(newData);

      } catch (err) {
        console.warn("Failed to fetch status", err);
        // Don't show error state for 404s on checks, just neutral
        if (err.status === 404) {
             const newData = { status: 'neutral', details: [], summary: 'ci_no_config', url: null };
             setCachedStatus(repoUrl, newData);
             setData(newData);
        } else {
             setData(prev => ({ ...prev, status: 'error' }));
        }
      }
    };

    fetchStatus();
  }, [repo?.id, token, status]);

  if (status === 'loading') return <span className="w-2 h-2 rounded-full bg-neutral-700 animate-pulse" title={t('ci_loading')} />;
  if (status === 'neutral') return <span className="w-2 h-2 rounded-full bg-neutral-700 opacity-30" title={t('ci_no_config')} />;
  if (status === 'error') return <span className="w-2 h-2 rounded-full bg-neutral-700 opacity-30" title={t('ci_unavailable')} />;

  const config = {
    success: { color: 'bg-emerald-500', ping: 'bg-emerald-400', icon: 'mdi:check-circle', text: t('ci_passed') },
    failure: { color: 'bg-red-500', ping: 'bg-red-400', icon: 'mdi:alert-circle', text: t('ci_failed') },
    pending: { color: 'bg-amber-500', ping: 'bg-amber-400', icon: 'mdi:clock-outline', text: t('ci_running') },
  };

  const { color, ping, icon, text } = config[status] || config.pending;

  const tooltipContent = (
      <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 mb-1">
              <Icon icon={icon} className={`text-lg ${status === 'success' ? 'text-emerald-400' : status === 'failure' ? 'text-red-400' : 'text-amber-400'}`} />
              <div>
                  <div className="font-semibold text-neutral-200">{t(summary)}</div>
                  <div className="text-[10px] text-neutral-500">{details.length} {details.length !== 1 ? t('ci_checks') : t('ci_check')}</div>
              </div>
          </div>
          <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto custom-scroll pr-1">
              {details.map((check) => (
                  <div key={check.id} className="flex items-center justify-between gap-4 text-[11px]">
                      <span className="text-neutral-400 truncate max-w-[140px]">{check.name}</span>
                      <Icon 
                        icon={
                            check.status === 'success' ? 'mdi:check' : 
                            check.status === 'failure' ? 'mdi:close' : 
                            'mdi:loading'
                        } 
                        className={
                            check.status === 'success' ? 'text-emerald-500' : 
                            check.status === 'failure' ? 'text-red-500' : 
                            'text-amber-500 animate-spin'
                        }
                      />
                  </div>
              ))}
          </div>
      </div>
  );

  return (
    <Tooltip content={tooltipContent}>
        <a 
        href={url}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => e.stopPropagation()} 
        className="relative flex h-2 w-2 group/status cursor-pointer"
        title={`CI/CD: ${text}`}
    >
        {(status === 'pending' || status === 'failure' || status === 'success') && (
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${ping}`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
        </a>
    </Tooltip>
  );
}
