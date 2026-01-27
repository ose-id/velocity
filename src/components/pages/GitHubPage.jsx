import React, { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';
import { Icon } from '@iconify/react';
import { toSshUrl } from '../../utils/helpers';
import { BUTTON_COLOR_STYLES, getButtonColorStyles } from '../../utils/constants';
import BatchActionBar from '../molecules/BatchActionBar';

// Placeholder Client ID - User needs to replace this or we implement a way to fetch it
// For now, we also support manual PAT entry.
const GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID'; 

export default function GitHubPage({ baseDir, onClone, editor, githubColors, onOpenColorMenu, onBatchClone }) {
  // CONFIG STATE
  const [token, setToken] = useState('');
  const [view, setView] = useState('init'); // init, auth_device, auth_pat, list
  
  // DATA STATE
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  // SELECTION STATE
  const [selectedIds, setSelectedIds] = useState([]);
  const isSelectionMode = selectedIds.length > 0;
  
  // DEVICE FLOW STATE
  const [deviceCodeData, setDeviceCodeData] = useState(null);

  // FILTERS
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, public, private

  // INIT: Load token from config (if saved - implementation pending in App.jsx or main process)
  useEffect(() => {
    async function loadToken() {
        if (!window.electronAPI) return;
        const cfg = await window.electronAPI.getConfig();
        if (cfg?.githubToken) {
            setToken(cfg.githubToken);
            setView('list');
        }
    }
    loadToken();
  }, []);

  // EFFECT: Fetch repos when entering list view
  useEffect(() => {
    if (view === 'list' && token) {
        fetchRepos();
        fetchUser();
    }
  }, [view, token]);

  const saveToken = async (newToken) => {
    setToken(newToken);
    if (window.electronAPI?.saveConfig) {
        await window.electronAPI.saveConfig({ githubToken: newToken });
    }
  };

  const fetchUser = async () => {
    try {
        const octokit = new Octokit({ auth: token });
        const { data } = await octokit.users.getAuthenticated();
        setUser(data);
    } catch (err) {
        console.error("Failed to fetch user", err);
        setError("Invalid Token or Network Error");
        setView('init');
    }
  };

  const fetchRepos = async () => {
      setLoading(true);
      setError(null);
      try {
          const octokit = new Octokit({ auth: token });
          // Fetching all repos (pagination separate logic, for now first 100)
          const { data } = await octokit.repos.listForAuthenticatedUser({
              per_page: 100,
              sort: 'updated',
              direction: 'desc'
          });
          setRepos(data);
      } catch (err) {
          console.error(err);
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleManualAuth = () => setView('auth_pat');
  const handleDeviceAuth = () => {
      setView('auth_pat'); 
      setError("OAuth (Device Flow) requires backend implementation. Please use Personal Access Token for now.");
  };

  const handlePatSubmit = async (e) => {
      e.preventDefault();
      const val = e.target.token.value;
      if (!val) return;
      await saveToken(val);
      setView('list');
  };

  const handleLogout = async () => {
      setToken('');
      setRepos([]);
      setView('init');
      await saveToken('');
  };

  const handleClone = (repo) => {
      if (isSelectionMode) {
          handleToggleSelection(repo.id);
          return;
      }

      if (onClone) {
          onClone({
              id: repo.name, // Use name as ID
              label: repo.name,
              repoUrl: repo.html_url,
              sshUrl: repo.ssh_url, // Add SSH URL
              folderName: repo.name,
              useSsh: false // Default to HTTPS
          });
      }
  };

  const handleToggleSelection = (repoId) => {
      setSelectedIds(prev => {
          if (prev.includes(repoId)) {
              return prev.filter(id => id !== repoId);
          }
          return [...prev, repoId];
      });
  };

  const handleBatchAction = () => {
      // Find repo objects for selected IDs
      const selectedRepos = repos.filter(r => selectedIds.includes(r.id)).map(r => ({
          id: r.name,
          label: r.name,
          repoUrl: r.html_url,
          sshUrl: r.ssh_url, // Add SSH URL
          folderName: r.name,
          useSsh: false
      }));
      
      if (onBatchClone) {
          onBatchClone(selectedRepos);
      }
  };

  const handleContextMenu = (e, repo) => {
      e.preventDefault();
      if (isSelectionMode) return;
      
      const customBtn = {
          id: repo.name, // ID matched against githubColors keys
          label: repo.name,
          color: githubColors[repo.name] || 'neutral',
          isGithub: true // Flag to tell App to use githubColors state
      };
      
      if (onOpenColorMenu) {
          onOpenColorMenu(customBtn, e);
      }
  };

  // RENDER
  if (view === 'init') {
      return (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-6">
              <Icon icon="mdi:github" className="text-8xl text-neutral-700" />
              <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-neutral-200">GitHub Integration</h2>
                  <p>Sign in to access your repositories directly.</p>
              </div>
              <div className="flex gap-4">
                  <button 
                    onClick={handleDeviceAuth}
                    className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg flex items-center gap-2 transition-all opacity-50 cursor-not-allowed"
                    title="Not implemented yet"
                  >
                      <Icon icon="mdi:github" />
                      Sign in with GitHub
                  </button>
                  <div className="relative">
                     <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-neutral-800"></div>
                     </div>
                 </div>
                  <button 
                    onClick={handleManualAuth}
                    className="px-6 py-2 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 rounded-lg transition-all"
                  >
                      I have a Token
                  </button>
              </div>
              {error && <p className="text-red-500">{error}</p>}
          </div>
      );
  }

  if (view === 'auth_pat') {
      return (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-4">
            <h2 className="text-xl font-bold text-neutral-200">Enter Personal Access Token</h2>
            <p className="max-w-md text-center text-sm">
                Generate a token on GitHub (Settings &gt; Developer settings &gt; Personal access tokens). 
                Scopes required: `repo` (for private repos) or just public access.
            </p>
            <form onSubmit={handlePatSubmit} className="flex flex-col gap-4 w-full max-w-sm">
                <input 
                    name="token"
                    type="password" 
                    placeholder="ghp_..." 
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                    autoFocus
                />
                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setView('init')} className="px-4 py-2 hover:text-white">Back</button>
                    <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">Save Token</button>
                </div>
            </form>
          </div>
      );
  }

  // LIST VIEW
  const filteredRepos = repos.filter(repo => {
      if (filterType === 'public' && repo.private) return false;
      if (filterType === 'private' && !repo.private) return false;
      if (search) {
          return repo.name.toLowerCase().includes(search.toLowerCase());
      }
      return true;
  });

  return (
      <div className="h-full flex flex-col relative">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-900 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-neutral-100">GitHub</h2>
                    <p className="text-xs text-neutral-400">
                        Total {filteredRepos.length} / {repos.length} repos
                        {user && <span className="ml-2 opacity-60">• {user.login}</span>}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                 <div className="relative">
                    <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search repos..."
                        className="bg-neutral-900 border border-neutral-800 rounded-full pl-9 pr-4 py-1.5 text-sm text-neutral-200 focus:outline-none focus:border-neutral-700 w-64"
                    />
                </div>
                <select 
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-sm text-neutral-300 focus:outline-none"
                >
                    <option value="all">All Repos</option>
                    <option value="public">Public only</option>
                    <option value="private">Private only</option>
                </select>
                <button 
                    onClick={fetchRepos} 
                    className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
                >
                    <Icon icon="mdi:refresh" className={loading ? "animate-spin" : ""} />
                </button>
                <button 
                    onClick={handleLogout}
                    className="text-xs text-red-400 hover:text-red-300 hover:underline px-2"
                >
                    Sign Out
                </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 pb-24">
            {loading && repos.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                    <Icon icon="mdi:loading" className="animate-spin text-2xl text-neutral-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRepos.map(repo => {
                        const colorId = githubColors?.[repo.name] || 'neutral';
                        const colorStyles = getButtonColorStyles(colorId);
                        const isSelected = selectedIds.includes(repo.id);

                        return (
                            <button
                                key={repo.id}
                                onClick={() => handleClone(repo)}
                                onContextMenu={(e) => handleContextMenu(e, repo)}
                                className={`group relative flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition w-full h-full ${colorStyles.card} cursor-pointer hover:shadow-lg ${isSelected ? 'ring-2 ring-neutral-100 ring-offset-2 ring-offset-neutral-950' : ''}`}
                            >
                                {/* Top Right: Clone Label (Hidden if selecting) & Checkbox */}
                                <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
                                    {!selectedIds.includes(repo.id) && !isSelectionMode && (
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full px-2 py-0.5 text-[10px] text-white border border-neutral-700">
                                            Clone
                                        </div>
                                    )}
                                    
                                    {/* Selection Checkbox */}
                                    <div 
                                        className={`transition-all duration-200 ${isSelected || isSelectionMode ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleSelection(repo.id);
                                        }}
                                    >
                                        <div className={`
                                          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200 cursor-pointer
                                          ${isSelected 
                                            ? 'bg-emerald-500 border-emerald-500' 
                                            : 'bg-black/40 border-neutral-500/50 hover:border-neutral-300'}
                                        `}>
                                          {isSelected && <Icon icon="mdi:check" className="text-white text-sm" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 flex items-center justify-between w-full gap-2 pr-6">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className={`h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center ${colorStyles.iconBg}`}>
                                            <Icon icon="mdi:github" className="text-neutral-100 text-lg" />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-medium text-neutral-50 truncate">{repo.name}</span>
                                            <span className="text-[11px] text-neutral-200/80 font-mono truncate max-w-[140px]">
                                                {repo.html_url || '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 mt-auto pt-2 flex items-center justify-between w-full">
                                    <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium text-neutral-300 border border-transparent ${colorStyles.pill}`}>
                                        <Icon icon="mdi:folder-outline" className="text-sm opacity-70" />
                                        <span className="truncate max-w-[80px]">{repo.name}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <div className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                        </div>

                                        <div className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2 py-0.5">
                                            <Icon
                                                icon={repo.private ? 'mdi:lock-outline' : 'mdi:globe'}
                                                className="text-[10px] text-neutral-200"
                                            />
                                            <span className="text-[10px] text-neutral-200">{repo.private ? 'Private' : 'Public'}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                    {filteredRepos.length === 0 && !loading && (
                        <div className="col-span-full text-center text-neutral-600 py-10">
                            No repositories found matching your filter.
                        </div>
                    )}
                </div>
            )}
          </div>

          <BatchActionBar 
              selectedCount={selectedIds.length} 
              onCancel={() => setSelectedIds([])}
              onClone={handleBatchAction}
          />
      </div>
  );
}
