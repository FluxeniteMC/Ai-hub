import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  GitCommitVertical,
  XCircle,
} from 'lucide-react';

import { catalog } from '../../lib/catalog';
import { formatRelativeTime } from '../../lib/format';
import type { RepoDeployment } from '../../types/catalog';

const STATUS_META: Record<string, { label: string; tone: 'positive' | 'danger' | 'muted' }> = {
  success: { label: 'Deployed', tone: 'positive' },
  failure: { label: 'Failed', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
  skipped: { label: 'Skipped', tone: 'muted' },
};

/**
 * Live repository status: the latest commit and the latest Pages deployment.
 * Both were resolved during the build, so this renders instantly and offline.
 */
export function LiveStatusCard() {
  const { commit, deployment, fetchedAt } = catalog.repoStatus;
  const meta = deployment?.conclusion ? STATUS_META[deployment.conclusion] : undefined;
  const StatusIcon =
    deployment?.conclusion === 'success'
      ? CheckCircle2
      : deployment?.conclusion === 'failure'
        ? XCircle
        : Clock;

  return (
    <div className="live-status">
      <div className="live-status__cell">
        <p className="live-status__label">
          <GitCommitVertical size={13} aria-hidden="true" />
          Latest commit
        </p>
        {commit ? (
          <>
            <a className="live-status__sha mono" href={commit.htmlUrl} target="_blank" rel="noopener noreferrer">
              {commit.shortSha}
              <ArrowUpRight size={12} aria-hidden="true" />
            </a>
            <p className="live-status__message">{commit.message}</p>
            <p className="live-status__meta">
              {commit.author}
              {commit.date ? ` · ${formatRelativeTime(commit.date)}` : ''}
            </p>
          </>
        ) : (
          <p className="live-status__meta">
            Commit details are unavailable in this build (the GitHub API could not be reached).
          </p>
        )}
      </div>

      <div className="live-status__cell">
        <p className="live-status__label">
          <StatusIcon size={13} aria-hidden="true" />
          Site deployment
        </p>
        {deployment ? (
          <>
            <span className={`live-status__pill live-status__pill--${meta?.tone ?? 'muted'}`}>
              {meta?.label ?? (deployment.status ?? 'unknown')}
            </span>
            <p className="live-status__meta">
              {deployment.updatedAt ? formatRelativeTime(deployment.updatedAt) : 'unknown'}
            </p>
            {deployment.htmlUrl ? (
              <a
                className="live-status__link"
                href={deployment.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View workflow run
                <ArrowUpRight size={11} aria-hidden="true" />
              </a>
            ) : null}
          </>
        ) : (
          <p className="live-status__meta">
            Deployment status is unavailable in this build.
          </p>
        )}
      </div>

      <div className="live-status__cell">
        <p className="live-status__label">
          <Clock size={13} aria-hidden="true" />
          Catalog built
        </p>
        <span className="live-status__sha mono">{catalog.source.fingerprint}</span>
        <p className="live-status__meta">
          {formatRelativeTime(catalog.generatedAt)}
          {fetchedAt ? ` · status checked ${formatRelativeTime(fetchedAt)}` : ''}
        </p>
      </div>
    </div>
  );
}

export type { RepoDeployment };