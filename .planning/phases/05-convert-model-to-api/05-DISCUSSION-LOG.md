# Phase 5: Convert model to API - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-13
**Phase:** 05-convert-model-to-api
**Areas discussed:** API Framework Choice, Data/Model Loading Strategy, Endpoint Design & Payload, Web Integration Constraints

---

## Firebase Integration & API Wrapping

| Option | Description | Selected |
|--------|-------------|----------|
| Firebase Cloud Functions (Python) + FastAPI + `.pkl` dump | Fast, serverless ML serving without slow CSV loads | ✓ |
| Standard Flask server | Traditional web server (not serverless) | |
| Build pipeline on start | Too slow for serverless cold-start | |

**User's choice:** "i want firebase as my backend so you tell" -> "would u be able to implement fastAPI on my website then go ahead"
**Notes:** User explicitly asked for Firebase. I proposed a plan to use Firebase Python functions with FastAPI and pre-exported Pickle data. User approved implementation of FastAPI.
