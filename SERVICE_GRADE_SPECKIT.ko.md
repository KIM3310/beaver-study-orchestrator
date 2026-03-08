# beaver-study-orchestrator Service-Grade SPECKIT

Last updated: 2026-03-08

## S - Scope
- 대상: syllabus parsing and study-plan orchestration service
- 이번 iteration 목표: reviewer가 첫 화면과 API만 보고도 extract -> plan -> simulate -> export contract를 이해하게 만든다.

## P - Product Thesis
- 이 repo는 스크립트가 아니라 `학습 계획 생성 서비스`로 읽혀야 한다.
- 입력 syllabus가 어떻게 actionable study plan으로 변하는지가 중요하다.

## E - Execution
- `/api/meta`, `/api/runtime/brief`, `/api/schema/analysis-report`를 추가해 health 밖에서도 reviewer surface를 고정한다.
- landing UI 상단에 runtime brief panel을 추가해 parser posture, schema, route count, operator rules를 먼저 보여준다.
- input parsing rules와 output schedule contract를 계속 테스트로 고정한다.

## C - Criteria
- local verification green
- README에서 입력/출력 경로와 review surfaces가 즉시 이해됨
- `/api/health`, `/api/meta`, `/api/runtime/brief`, `/api/schema/analysis-report` contract가 일관된다.
- parsing edge cases가 흔들리지 않음

## K - Keep
- orchestrator 중심 사고
- practical learner output

## I - Improve
- calendar export / screenshot pack 강화
- syllabus edge-case fixtures 추가
- course history 기반 personalization을 추가하기 전까지 현재 heuristic boundary를 명확히 문서화

## T - Trace
- `README.md`
- `app/`
- `tests/`
- `.github/workflows/`
