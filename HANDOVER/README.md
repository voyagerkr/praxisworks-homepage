# praxisworks-homepage — 인프라 인수인계 (2026-11-04, 최석준 → 코지)

> 전체 인수인계(계정·권한 회수·진행 중인 일·함정)는 **`voyagerkr/timo-iac` 의 `HANDOVER/README.md`**. 이 파일은 이 레포에 걸린 인프라만 적는다. 비밀값은 없다 — 위치만.

| 항목 | 값 |
|---|---|
| 계정 | praxis 378780515122(프로필 `praxis`) |
| IaC | `timo-iac: praxis-aws (루트)` (state `homepage/terraform.tfstate` in `praxisworks-tfstate`) |
| 주소 | prod `praxisworks.dev(+www)` · qa `qa.praxisworks.dev` |
| 버킷 | `praxisworks-homepage-prod` · `praxisworks-homepage-qa` (비공개, CloudFront OAC, 인증서 us-east-1) |
| 배포 | `prod / qa` 브랜치 push → `.github/workflows/deploy-aws.yml` → 빌드 → `s3 sync --delete` → CloudFront 무효화 |
| 자격 | 레포 시크릿 `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`(정적 키, OIDC 아님). **어느 IAM 사용자 키인지 확인 필요 — 최석준(`sjchoi`) 키면 퇴사 전 교체** |

- 빌드 pnpm. 옛 `deploy-pages.yml`(GitHub Pages)이 아직 레포에 있음 — 비활성 여부 확인 필요.
