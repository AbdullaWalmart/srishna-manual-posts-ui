import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllPosts, setPostActive, deletePost } from '../api';
import './PostsList.css';

const PAGE_SIZES = [5, 10, 25, 50];
const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date (newest first)' },
  { value: 'date-asc', label: 'Date (oldest first)' },
  { value: 'caption-asc', label: 'Caption (A–Z)' },
  { value: 'caption-desc', label: 'Caption (Z–A)' }
];

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|ogg|m4v)(\?|$)/i;

function isVideoUrl(url) {
  return url && VIDEO_EXTENSIONS.test(url);
}

function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeCsvCell(str) {
  if (str == null) return '';
  const s = String(str).replace(/"/g, '""');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
}

function filterAndSort(list, search, sort) {
  let out = [...list];
  const q = search.trim().toLowerCase();
  if (q) {
    out = out.filter(
      (p) =>
        (p.textContent && p.textContent.toLowerCase().includes(q)) ||
        (p.uploaderName && p.uploaderName.toLowerCase().includes(q)) ||
        String(p.id).includes(q)
    );
  }
  const [field, dir] = sort.split('-');
  if (field === 'date') {
    out.sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dir === 'desc' ? tB - tA : tA - tB;
    });
  } else if (field === 'caption') {
    out.sort((a, b) => {
      const sa = (a.textContent || '').toLowerCase();
      const sb = (b.textContent || '').toLowerCase();
      const cmp = sa.localeCompare(sb);
      return dir === 'asc' ? cmp : -cmp;
    });
  }
  return out;
}

export default function PostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date-desc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagePreview, setImagePreview] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAllPosts();
      setPosts(data);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const activePosts = useMemo(() => posts.filter((p) => p.active), [posts]);
  const inactivePosts = useMemo(() => posts.filter((p) => !p.active), [posts]);

  const currentList = activeTab === 'active' ? activePosts : inactivePosts;
  const filteredAndSorted = useMemo(
    () => filterAndSort(currentList, search, sort),
    [currentList, search, sort]
  );

  const totalFiltered = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);
  const start = (pageIndex - 1) * pageSize;
  const pageRows = filteredAndSorted.slice(start, start + pageSize);

  const handleSetActive = async (postId, active) => {
    setActionId(postId);
    try {
      await setPostActive(postId, active);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, active } : p))
      );
    } catch (err) {
      setError(err.message || 'Failed to update');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Permanently delete this post? This cannot be undone.')) return;
    setActionId(postId);
    try {
      await deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      setError(err.message || 'Failed to delete');
    } finally {
      setActionId(null);
    }
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'Uploader', 'Caption', 'Status', 'Created At', 'Image URL'];
    const rows = filteredAndSorted.map((p) => [
      p.id,
      p.uploaderName || '—',
      p.textContent || '',
      p.active ? 'Active' : 'Inactive',
      p.createdAt ? formatDate(p.createdAt) : '',
      p.imageUrl || ''
    ]);
    const csv = [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.map(escapeCsvCell).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `posts-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openMediaPreview = (post) => {
    if (post.imageUrl) setImagePreview({ url: post.imageUrl, caption: post.textContent, isVideo: isVideoUrl(post.imageUrl) });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="posts-list-page">
        <div className="posts-list-loading">Loading posts…</div>
      </div>
    );
  }

  return (
    <div className="posts-list-page">
      <div className="posts-list-header">
        <h1>Posts</h1>
        <p className="posts-list-sub">Active posts appear in the public list. Inactive posts are hidden. Click an image to view full size and avoid duplicates.</p>
      </div>

      {error && (
        <div className="posts-list-error">
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Dismiss">×</button>
        </div>
      )}

      <div className="posts-tabs">
        <button
          type="button"
          className={`posts-tab ${activeTab === 'active' ? 'posts-tab--active' : ''}`}
          onClick={() => { setActiveTab('active'); setCurrentPage(1); }}
        >
          Active ({activePosts.length})
        </button>
        <button
          type="button"
          className={`posts-tab ${activeTab === 'inactive' ? 'posts-tab--active' : ''}`}
          onClick={() => { setActiveTab('inactive'); setCurrentPage(1); }}
        >
          Inactive ({inactivePosts.length})
        </button>
      </div>

      <div className="posts-toolbar">
        <div className="posts-toolbar-left">
          <input
            type="search"
            placeholder="Search by caption or ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="posts-search"
            aria-label="Search posts"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="posts-sort"
            aria-label="Sort by"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button type="button" className="posts-export-btn" onClick={handleExportCsv}>
            Export CSV
          </button>
        </div>
        <div className="posts-toolbar-right">
          <label className="posts-page-size">
            <span>Rows</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="posts-page-size-select"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <span className="posts-toolbar-count">
            {totalFiltered === 0 ? '0' : `${start + 1}-${Math.min(start + pageSize, totalFiltered)}`} of {totalFiltered}
          </span>
        </div>
      </div>

      <div className="posts-table-wrap">
        <table className="posts-table">
          <thead>
            <tr>
              <th className="posts-table-col-image">Image</th>
              <th className="posts-table-col-text">Caption</th>
              <th className="posts-table-col-uploader">Uploader</th>
              <th className="posts-table-col-date">Date</th>
              {activeTab === 'active' && (
                <th className="posts-table-col-status">Status</th>
              )}
              <th className="posts-table-col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={activeTab === 'active' ? 6 : 5} className="posts-table-empty">
                  {currentList.length === 0 ? (
                    activeTab === 'active' ? (
                      <>No active posts. <Link to="/upload">Upload one</Link> or activate a post from the Inactive tab.</>
                    ) : (
                      'No inactive posts.'
                    )
                  ) : (
                    'No posts match your search.'
                  )}
                </td>
              </tr>
            ) : (
              pageRows.map((post) => (
                <tr key={post.id}>
                  <td className="posts-table-col-image">
                    <button
                      type="button"
                      className="posts-table-thumb-btn"
                      onClick={() => openMediaPreview(post)}
                      title={isVideoUrl(post.imageUrl) ? 'View video' : 'View full size'}
                    >
                      <div className="posts-table-thumb">
                        {post.imageUrl ? (
                          isVideoUrl(post.imageUrl) ? (
                            <video src={post.imageUrl} muted playsInline loop preload="metadata" className="posts-table-thumb-media" />
                          ) : (
                            <img src={post.imageUrl} alt="" loading="lazy" className="posts-table-thumb-media" />
                          )
                        ) : (
                          <span className="posts-table-thumb-placeholder">No media</span>
                        )}
                      </div>
                    </button>
                  </td>
                  <td className="posts-table-col-text">
                    <span className="posts-table-text">
                      {post.textContent ? post.textContent.slice(0, 80) + (post.textContent.length > 80 ? '…' : '') : '—'}
                    </span>
                  </td>
                  <td className="posts-table-col-uploader">
                    {post.uploaderName || '—'}
                  </td>
                  <td className="posts-table-col-date">
                    {formatDate(post.createdAt)}
                  </td>
                  {activeTab === 'active' && (
                    <td className="posts-table-col-status">
                      <span className="posts-table-badge posts-table-badge--active">Active</span>
                    </td>
                  )}
                  <td className="posts-table-col-actions">
                    <div className="posts-table-actions">
                      {post.active ? (
                        <button
                          type="button"
                          className="posts-table-btn posts-table-btn--deactivate"
                          onClick={() => handleSetActive(post.id, false)}
                          disabled={actionId === post.id}
                          title="Hide from public list"
                        >
                          {actionId === post.id ? '…' : 'Deactivate'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="posts-table-btn posts-table-btn--activate"
                          onClick={() => handleSetActive(post.id, true)}
                          disabled={actionId === post.id}
                          title="Show in public list"
                        >
                          {actionId === post.id ? '…' : 'Activate'}
                        </button>
                      )}
                      <button
                        type="button"
                        className="posts-table-btn posts-table-btn--delete"
                        onClick={() => handleDelete(post.id)}
                        disabled={actionId === post.id}
                        title="Permanently delete post"
                      >
                        {actionId === post.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="posts-pagination">
          <button
            type="button"
            className="posts-pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={pageIndex <= 1}
            aria-label="Previous page"
          >
            Previous
          </button>
          <span className="posts-pagination-info">
            Page {pageIndex} of {totalPages}
          </span>
          <button
            type="button"
            className="posts-pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={pageIndex >= totalPages}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      )}

      {imagePreview && (
        <div
          className="posts-image-popup-overlay"
          onClick={() => setImagePreview(null)}
          role="dialog"
          aria-modal="true"
          aria-label={imagePreview.isVideo ? 'View video' : 'View image'}
        >
          <div className="posts-image-popup" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="posts-image-popup-close"
              onClick={() => setImagePreview(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="posts-image-popup-media-wrap">
              {imagePreview.isVideo ? (
                <video src={imagePreview.url} controls autoPlay className="posts-image-popup-media" />
              ) : (
                <img src={imagePreview.url} alt="Post" className="posts-image-popup-media" />
              )}
            </div>
            {imagePreview.caption && (
              <p className="posts-image-popup-caption">{imagePreview.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
