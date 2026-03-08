# beaver-study-orchestrator Service-Grade SPECKIT

Last updated: 2026-03-08

## S - Scope
- 대상: syllabus parsing and study-plan orchestration service
- baseline 목표: course ingest, planning contract, learner-facing output 품질을 서비스 수준으로 정리

## P - Product Thesis
- 이 repo는 스크립트가 아니라 `학습 계획 생성 서비스`로 읽혀야 한다.
- 입력 syllabus가 어떻게 actionable study plan으로 변하는지가 중요하다.

## E - Execution
- input parsing rules와 output schedule contract를 명확히 유지
- sample syllabus와 generated plan evidence를 계속 재현 가능하게 유지
- 현재 CI를 baseline으로 유지

## C - Criteria
- local verification green
- README에서 입력/출력 경로가 즉시 이해됨
- parsing edge cases가 흔들리지 않음

## K - Keep
- orchestrator 중심 사고
- practical learner output

## I - Improve
- calendar export / screenshot pack 강화
- syllabus edge-case fixtures 추가

## T - Trace
- `README.md`
- `app/`
- `tests/`
- `.github/workflows/`

