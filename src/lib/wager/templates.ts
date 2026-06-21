import type { SourceInput } from "@/lib/genlayer/types";

export interface WagerTemplate {
  id: string;
  title: string;
  win_condition: string;
  loss_condition: string;
  deadline_offset_hours: number;
  accepted_proof: string;
  excluded_proof: string;
  sources: SourceInput[];
}

export const DEMO_TEMPLATES: WagerTemplate[] = [
  {
    id: "deployment-deadline",
    title: "Landing page live before deadline",
    win_condition:
      "The P2PStake landing page loads at the public Vercel URL and displays the agreed hero section before the deadline.",
    loss_condition:
      "The page does not load, is not publicly accessible, or does not display the agreed content before the deadline.",
    deadline_offset_hours: 72,
    accepted_proof:
      "The public URL must load before the deadline and display the agreed hero section. Deployment logs or GitHub commits showing the deploy timestamp are valid supporting evidence.",
    excluded_proof:
      "Figma files, private preview links, local screenshots, localhost URLs, and verbal claims do not count.",
    sources: [
      {
        source_id: "vercel-deploy",
        source_type: "public_url",
        label: "Vercel Deployment URL",
        url: "https://p2pstake.vercel.app",
        description:
          "The public deployment URL that must load and show the agreed landing page.",
        required: true,
        is_fallback: false,
      },
      {
        source_id: "github-deploy",
        source_type: "github",
        label: "GitHub Deployment Commit",
        url: "https://github.com/user/p2pstake/commits/main",
        description:
          "Fallback: GitHub commit history showing deployment activity before the deadline.",
        required: false,
        is_fallback: true,
      },
    ],
  },
  {
    id: "pr-merge",
    title: "Pull request merged before demo day",
    win_condition:
      "The specified pull request is merged into the main branch before the deadline.",
    loss_condition:
      "The pull request is not merged, is closed without merge, or remains open past the deadline.",
    deadline_offset_hours: 48,
    accepted_proof:
      "The GitHub pull request page must show 'Merged' status with a merge timestamp before the deadline.",
    excluded_proof:
      "Draft PRs, force-pushed commits, local git logs, and verbal claims do not count.",
    sources: [
      {
        source_id: "github-pr",
        source_type: "github",
        label: "GitHub Pull Request",
        url: "https://github.com/user/repo/pull/1",
        description:
          "The pull request that must be merged before the deadline.",
        required: true,
        is_fallback: false,
      },
    ],
  },
  {
    id: "social-metric",
    title: "Tweet reaches 10K likes before Monday",
    win_condition:
      "The specified tweet shows 10,000 or more likes before the deadline.",
    loss_condition:
      "The tweet has fewer than 10,000 likes at the deadline, or the tweet is deleted.",
    deadline_offset_hours: 120,
    accepted_proof:
      "The public tweet URL must show the like count. Screenshots must include the full tweet URL visible in the browser address bar.",
    excluded_proof:
      "Analytics dashboards, third-party tracking tools, deleted tweets, and verbal claims do not count.",
    sources: [
      {
        source_id: "tweet-url",
        source_type: "social_post",
        label: "Tweet URL",
        url: "https://x.com/user/status/123456",
        description:
          "The public tweet that must reach the target like count.",
        required: true,
        is_fallback: false,
      },
    ],
  },
];
