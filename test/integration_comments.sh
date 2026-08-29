#!/usr/bin/env bash
set -euo pipefail

tmp_dir="$(mktemp -d)"
tmp_override="${tmp_dir}/comments-test-override.yml"
tmp_site="${tmp_dir}/site"
tmp_source="${tmp_dir}/source"

cleanup() {
  rm -rf "${tmp_dir}"
}
trap cleanup EXIT

mkdir -p "${tmp_source}"
git archive --format=tar HEAD | tar -xf - -C "${tmp_source}"

mkdir -p "${tmp_source}/_posts"
cat >"${tmp_source}/_posts/2022-12-10-giscus-comments.md" <<'MARKDOWN'
---
layout: post
title: Giscus integration fixture
date: 2022-12-10 11:59:00-0400
giscus_comments: true
related_posts: false
---

Temporary integration fixture.
MARKDOWN

cat >"${tmp_source}/_posts/2015-10-20-disqus-comments.md" <<'MARKDOWN'
---
layout: post
title: Disqus integration fixture
date: 2015-10-20 11:59:00-0400
disqus_comments: true
related_posts: false
---

Temporary integration fixture.
MARKDOWN

cat >"${tmp_override}" <<'YAML'
giscus:
  repo: alshedivat/al-folio
  repo_id: R_kgDOExample
  category: Comments
  category_id: DIC_kwDOExample
YAML

bundle exec jekyll build --source "${tmp_source}" --config "${tmp_source}/_config.yml,${tmp_override}" -d "${tmp_site}" >/dev/null

giscus_page="${tmp_site}/blog/2022/giscus-comments/index.html"
disqus_page="${tmp_site}/blog/2015/disqus-comments/index.html"

grep -q 'https://giscus.app/client.js' "${giscus_page}"
if grep -q 'giscus comments misconfigured' "${giscus_page}"; then
  echo "unexpected giscus misconfiguration warning in ${giscus_page}" >&2
  exit 1
fi

grep -q 'id="disqus_thread"' "${disqus_page}"
grep -q '.disqus.com/embed.js' "${disqus_page}"

echo "comments integration checks passed"
