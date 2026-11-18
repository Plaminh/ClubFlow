# Authentication and Profile

These endpoints support C2 and the existing Sign In/My Profile screens. PA#3 uses deterministic mock credentials and bearer tokens; it does not claim production JWT, password hashing, or server-side token revocation.

## POST /api/auth/login

Public. Authenticates a demo account.

Request fields:

| Field | Type | Rules |
| --- | --- | --- |
| `username` | string | Required; one documented `Name in examples` value. |
| `password` | string | Required; exact deterministic demo password. |

Success: `200` with exactly `token` and `user`. Errors: `400 INVALID_REQUEST`; `401 INVALID_CREDENTIALS`.

The repeated login examples initialize every token alias used later.

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
  "token": "mock-token-exec",
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
  "token": "mock-token-studentA",
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
  "token": "mock-token-studentB",
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
  "token": "mock-token-int-content",
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
  "token": "mock-token-int-comms",
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

Any authenticated role. Accepts only `displayName` and `email`; all other profile fields are read-only. Updating a profile does not rewrite the `studentInfo` snapshots already stored on applications.

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

Any authenticated role. Ends the current client session. The PA#3 mock may use deterministic stateless tokens, so the required observable behavior is that the client discards its token; production revocation is outside this contract.

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
  "token": "mock-token-exec",
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

- 2026-11-18: Finalized canonical account examples, deterministic token aliases, username/password request fields, current-user/profile projections, logout semantics, and applicable errors for the reviewed contract.
- 2026-11-17: Added the initial login, current-user, logout, and own-profile contract using checker-compatible `username` credentials.
