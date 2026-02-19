import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

import Tooltip from './Tooltip';

export default function GitHubStatusIndicator({ repoUrl, token }) {
  const [status, setStatus] = useState('loading'); // loading, success, failure, pending, neutral
  const [url, setUrl] = useState(null);
  const [details, setDetails] = useState([]);
  const [summary, setSummary] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (!token || !repoUrl) {
      setStatus('neutral');
      return;
    }

    let owner, repo;
    try {
      if (repoUrl.startsWith('git@')) {
        const parts = repoUrl.split(':');
        if (parts.length > 1) {
          const path = parts[1].replace('.git', '');
          [owner, repo] = path.split('/');
        }
      } else {
        const urlObj = new URL(repoUrl);
        const parts = urlObj.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          owner = parts[0];
          repo = parts[1].replace('.git', '');
        }
      }
    } catch (e) {
      console.error("Invalid repo URL", repoUrl);
      setStatus('neutral');
      return;
    }

    if (!owner || !repo) {
      setStatus('neutral');
      return;
    }

    const fetchStatus = async () => {
      try {
        const octokit = new Octokit({ auth: token });
        const { data: repoData } = await octokit.repos.get({ owner, repo });
        const defaultBranch = repoData.default_branch;

        // Fetch checks
        const { data: checkRuns } = await octokit.checks.listForRef({
          owner,
          repo,
          ref: defaultBranch,
          per_page: 20
        });

        // Fetch legacy status for context
        const { data: legacyStatus } = await octokit.repos.getCombinedStatusForRef({
            owner,
            repo,
            ref: defaultBranch
        });


        let finalStatus = 'neutral';
        let checkDetails = [];
        let summaryText = 'ci_no_config';

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
          setUrl(`${repoData.html_url}/actions`);

        } else if (legacyStatus.total_count > 0) {
             finalStatus = legacyStatus.state; // success, failure, pending
             checkDetails = legacyStatus.statuses.map(s => ({
                 name: s.context,
                 status: s.state,
                 url: s.target_url,
                 id: s.id
             }));
             summaryText = finalStatus === 'success' ? 'ci_all_passed' : 'ci_checks_failed';
             setUrl(`${repoData.html_url}/commits/${defaultBranch}`);
        }

        setStatus(finalStatus);
        setDetails(checkDetails);
        setSummary(summaryText);

      } catch (err) {
        console.warn("Failed to fetch status", err);
        setStatus('error');
      }
    };

    fetchStatus();
  }, [repoUrl, token]);

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
