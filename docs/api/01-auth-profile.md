# Authentication and Profile

These endpoints support C2 and the existing Sign In/My Profile screens. Accounts come from the seed (README, Seed State); there is no self-registration (brief decision D-10). Passwords are stored as bcrypt hashes. Tokens are JWTs signed with HS256 by the server's `JWT_SECRET` and expire at most 24 hours after sign-in; the server does not revoke tokens.

## POST /api/auth/login

Public. Authenticates a demo account.

Request fields:

| Field | Type | Rules |
| --- | --- | --- |
| `username` | string | Required, non-blank; the account's `Name in examples` (`handle`). |
| `password` | string | Required, non-blank. |

Success: `200` with exactly `token` and `user`. Errors: `400 VALIDATION_ERROR` with `fieldErrors.username` or `fieldErrors.password`; `401 INVALID_CREDENTIALS`.

A wrong password and an unknown username get the same `401 INVALID_CREDENTIALS` answer, so the answer does not reveal which accounts exist. A `role` field in the body is ignored. Example token values are shown as `"…"`.

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "username": "exec",
  "password": "ClubFlowDemo!"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "…",
  "user": {
    "id": "exec-recruitment",
    "handle": "exec",
    "role": "executive",
    "displayName": "Recruitment Executive",
    "email": "executive@clubflow.demo.example",
    "description": "Technology and Innovation Club"
  }
}
```

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "username": "studentA",
  "password": "ClubFlowDemo!"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "…",
  "user": {
    "id": "ap-minhanh",
    "handle": "studentA",
    "role": "applicant",
    "displayName": "Nguyen Minh Anh",
    "email": "minh.anh@demo.example",
    "studentId": "26DEMO0142",
    "faculty": "Information Technology",
    "year": "Year 2"
  }
}
```

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "username": "studentB",
  "password": "ClubFlowDemo!"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "…",
  "user": {
    "id": "ap-quocbao",
    "handle": "studentB",
    "role": "applicant",
    "displayName": "Pham Quoc Bao",
    "email": "quoc.bao@demo.example",
    "studentId": "26DEMO0177",
    "faculty": "Design",
    "year": "Year 3"
  }
}
```

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "username": "int-content",
  "password": "ClubFlowDemo!"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "…",
  "user": {
    "id": "iv-giahuy",
    "handle": "int-content",
    "role": "interviewer",
    "displayName": "Gia Huy",
    "email": "gia.huy@clubflow.demo.example",
    "description": "Content"
  }
}
```

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "username": "int-comms",
  "password": "ClubFlowDemo!"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "…",
  "user": {
    "id": "iv-comms",
    "handle": "int-comms",
    "role": "interviewer",
    "displayName": "Linh Tran",
    "email": "linh.tran@clubflow.demo.example",
    "description": "Communications"
  }
}
```

Student C has no application in the seed:

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "username": "studentC",
  "password": "ClubFlowDemo!"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "…",
  "user": {
    "id": "ap-lanchi",
    "handle": "studentC",
    "role": "applicant",
    "displayName": "Tran Lan Chi",
    "email": "lan.chi@demo.example",
    "studentId": "26DEMO0193",
    "faculty": "Business Administration",
    "year": "Year 1"
  }
}
```

A wrong password and an unknown username get the same answer:

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "username": "studentA",
  "password": "wrong-password"
}
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "The username or password is incorrect.",
  "code": "INVALID_CREDENTIALS"
}
```

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "username": "nobody",
  "password": "ClubFlowDemo!"
}
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "error": "The username or password is incorrect.",
  "code": "INVALID_CREDENTIALS"
}
```

## GET /api/auth/me

Any authenticated role. Returns the token's User DTO. It never accepts a user ID from the client.

Success: `200`. Error: `401 INVALID_TOKEN`.

```http
GET /api/auth/me HTTP/1.1
Authorization: Bearer {{token:studentA}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "ap-minhanh",
  "handle": "studentA",
  "role": "applicant",
  "displayName": "Nguyen Minh Anh",
  "email": "minh.anh@demo.example",
  "studentId": "26DEMO0142",
  "faculty": "Information Technology",
  "year": "Year 2"
}
```

## GET /api/me/profile

Any authenticated role. Returns the caller's editable profile projection.

Success: `200`. Error: `401 INVALID_TOKEN`.

```http
GET /api/me/profile HTTP/1.1
Authorization: Bearer {{token:studentA}}
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "ap-minhanh",
  "role": "applicant",
  "displayName": "Nguyen Minh Anh",
  "email": "minh.anh@demo.example",
  "studentId": "26DEMO0142",
  "faculty": "Information Technology",
  "year": "Year 2"
}
```

## PATCH /api/me/profile

Any authenticated role. Accepts only `displayName` and `email`; all other profile fields are read-only, and any other body field — `role` included — is ignored, never stored. Updating a profile does not rewrite the `studentInfo` snapshots already stored on applications.

| Field | Type | Rules |
| --- | --- | --- |
| `displayName` | string | Required, non-blank after trimming. |
| `email` | string | Required, valid email, unique across users. |

Success: `200`. Errors: `400 VALIDATION_ERROR` with `fieldErrors.displayName` or `fieldErrors.email`; `401 INVALID_TOKEN`; `409 EMAIL_ALREADY_USED`.

```http
PATCH /api/me/profile HTTP/1.1
Authorization: Bearer {{token:studentA}}
Content-Type: application/json
Accept: application/json

{
  "displayName": "Nguyen Minh Anh",
  "email": "minh.anh@demo.example"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "ap-minhanh",
  "role": "applicant",
  "displayName": "Nguyen Minh Anh",
  "email": "minh.anh@demo.example",
  "studentId": "26DEMO0142",
  "faculty": "Information Technology",
  "year": "Year 2"
}
```

## POST /api/auth/logout

Any authenticated role. Ends the current client session. Tokens are stateless JWTs, so the required observable behavior is that the client discards its token; the server does not revoke it before its `exp`.

Success: `204`. Error: `401 INVALID_TOKEN`.

```http
POST /api/auth/logout HTTP/1.1
Authorization: Bearer {{token:exec}}
Accept: application/json
```

```http
HTTP/1.1 204 No Content
```

The checker logs `exec` in again so subsequent examples do not rely on a logged-out token.

```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
Accept: application/json

{
  "username": "exec",
  "password": "ClubFlowDemo!"
}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "…",
  "user": {
    "id": "exec-recruitment",
    "handle": "exec",
    "role": "executive",
    "displayName": "Recruitment Executive",
    "email": "executive@clubflow.demo.example",
    "description": "Technology and Innovation Club"
  }
}
```

## Changes

- 2026-11-21 (PA#4): Tokens are JWTs (HS256, at most 24 hours) and examples show them as `"…"` instead of the mock's `mock-token-<name>`. Passwords stored hashed; no self-registration (D-10). Login validation error is `400 VALIDATION_ERROR` with field messages (was `400 INVALID_REQUEST`); a wrong password and an unknown username give the same `401 INVALID_CREDENTIALS`, with two examples. Added the seed account `studentC` (no application) and its login example. `role` and other undocumented fields are ignored by login and `PATCH /api/me/profile`. Logout: the server does not revoke a token before `exp`. Why: the PA#4 rubric (criterion 5) and the seed state in README.
- 2026-11-18: Finalized canonical account examples, deterministic token aliases, username/password request fields, current-user/profile projections, logout semantics, and applicable errors for the reviewed contract.
- 2026-11-17: Added the initial login, current-user, logout, and own-profile contract using checker-compatible `username` credentials.
