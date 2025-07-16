**Pillars of Insight — Data Model & API Definition**

**1\. Introduction & Purpose**  
Define the core data entities, their attributes, and the service/API endpoints required to support the UI/UX flows for Pillars of Insight.

---

**2\. Domain Entities & Fields**

**2.1 Brick**

* id (UUID)

* title (string)

* url (string)

* creator (string, optional)

* thumbnail (string URL)

* transcript (text/blob)

* snippets (array of { timestamp, text })

* createdAt, updatedAt (datetime)

**2.2 Pillar**

* id (UUID)

* title (string)

* brickIds (array of Brick IDs)

* order (array of Brick IDs)

* createdAt, updatedAt (datetime)

**2.3 Portico**

* id (UUID)

* title (string)

* pillarIds (array of Pillar IDs)

* createdAt, updatedAt (datetime)

**2.4 Palisade**

* id (UUID)

* title (string)

* porticoIds (array of Portico IDs)

* createdAt, updatedAt (datetime)

**2.5 Arch**

* id (UUID)

* fromPillarId, toPillarId (UUID)

* summary (string)

* createdAt, updatedAt (datetime)

**2.6 Path**

* id (UUID)

* sequence (array of Brick or Pillar IDs)

* title (string)

* createdAt, updatedAt (datetime)

**2.7 Quarry**

* id (UUID)

* brickIds (array of Brick IDs)

* createdAt, updatedAt (datetime)

**2.8 Pool**

* id (UUID)

* assetRefs (array of { type: Book|Note|Chart|Image, referenceId })

* createdAt, updatedAt (datetime)

**2.9 Ripple**

* id (UUID)

* type (onetime|recurring|event-triggered)

* targetEntity (Brick|Pillar|Portico|Palisade)

* targetId (UUID)

* schedule (cron/rrule)

* criteria (filters for relevant content)

* createdAt, updatedAt (datetime)

---

**3\. Relationships & Constraints**

* A Brick **belongsTo** zero or more Pillars

* A Pillar **belongsTo** one Portico

* A Portico **belongsTo** one Palisade

* Arches connect exactly two Pillars

* Paths sequence Bricks and/or Pillars across Palisades

---

**4\. API Endpoints**

**4.1 Bricks**

* POST /api/bricks  
  Request: { url, description? }  
  Response: 201 { id, title, thumbnail, ... }

* GET /api/bricks/:id  
  Response: 200 { id, url, transcript?, snippets?, ... }

* GET /api/bricks  
  Query: ?page\&limit\&filter  
  Response: 200 \[{id,title},...\]

**4.2 Pillars**

* POST /api/pillars  
  Request: { title, brickIds? }  
  Response: 201 { id, title, brickIds }

* PUT /api/pillars/:id  
  Request: { addBricks?, removeBricks?, order? }  
  Response: 200 { id, brickIds }

* GET /api/pillars/:id  
  Response: 200 { id, title, bricks: \[...\] }

**4.3 Porticos & Palisades**

* Similar CRUD for /api/porticos and /api/palisades with pillarIds & porticoIds fields.

**4.4 Arches & Paths**

* POST /api/arches  
  Request: { fromPillarId, toPillarId, summary }

* POST /api/paths  
  Request: { sequence, title }

**4.5 Quarry & Pool**

* POST /api/quarry  
  Request: { brickId }

* POST /api/pool  
  Request: { assetType, referenceId }

**4.6 Ripples**

* POST /api/ripples  
  Request: { type, targetEntity, targetId, schedule, criteria }

* GET /api/ripples  
  Response: 200 \[{...}\]

---

**5\. Example Payloads**

**POST** **/api/bricks**  
{ "url": "https://www.youtube.com/watch?v=abc123" }

**PUT** **/api/pillars/xyz**  
{ "addBricks": \["brick1","brick2"\] }

---

**6\. Error Handling & Status Codes**

* 400 Bad Request for validation errors

* 404 Not Found for missing entities

* 409 Conflict for duplicate actions

* 500 Internal Server Error for unexpected failures

---

**7\. Authentication & Security**

* Bearer token via Authorization: Bearer \<token\> header

* Role-based access: read-only vs read-write

* Rate limiting on Brick creation (e.g., 10/min)

---

**8\. Versioning & Endpoint Structure**

* Prefix all APIs with /v1/

* Semantic version header: Accept: application/vnd.poi.v1+json

---

**9\. Next Steps & Integration**

* Map UI flows to API calls

* Define GraphQL schema if needed

* Design DB schema and indexes

* Mock responses for front-end development