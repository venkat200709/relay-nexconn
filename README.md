# Relay — Dispatch-First Chat for Neighbourhood Help

Built for the **Nexconn Build Challenge 2026** (Open Innovation Track)  
**Team Hexcore:** Venkatesan Neelakandan (Team Leader) & Sasmita Shree P  
**App Key:** `e0x9wycferqnq` (Singapore Data Center)

---

## What We Built

In every neighbourhood, someone needs quick help right now: an elderly person out of prescription heart medicine in the rain, a parent with a sick toddler who cannot run out for baby formula, or a resident struggling to read a hospital discharge form. 

Today, people post these needs in chaotic WhatsApp or Telegram group chats. Messages get buried in seconds. Nobody knows who is helping whom, whether a pharmacy run was already completed, or if the requester is still waiting. 

**Relay** is a dispatch-first community chat designed specifically for neighbourhood mutual aid. When a neighbour posts a need, Relay creates a dedicated help ticket. Volunteers see a live feed of open tickets filtered by urgency and category. When a volunteer claims a ticket, Relay immediately opens a dedicated 1-on-1 chat room powered by the **Nexconn Chat SDK**. Both sides stay coordinated through a clear four-step status flow (`Open` → `Claimed` → `In Progress` → `Resolved`) until the task is complete.

---

## Key Features

- **Dual-Persona Experience:** One-click instant switching between Requesters and Volunteers for 30-second judge evaluations.
- **Urgent Need Posting:** Categories for Medicine Runs, Groceries, Transport, Translation, Elder Check-ins, Household Repairs, and Pet Care with visual urgency badges.
- **Voice Dictation:** Hands-free voice-to-text input via the Web Speech API so seniors and busy parents can speak their need aloud.
- **Live Dispatch Feed:** Real-time list of neighbourhood tickets with status badges and instant claim actions.
- **Dedicated Dispatch Chat Rooms:** Real-time messaging directly between requester and volunteer using Nexconn's direct channel infrastructure.
- **Status Progression Banner:** Live 4-stage banner (`Open` → `Claimed` → `In Progress` → `Resolved`) visible to both parties with automated state sync.
- **Real-Time Feedback:** Typing indicators (`channel.sendTypingStatus`) and read receipt sync (`channel.clearUnreadCount`).
- **Quick-Reply Action Chips:** One-tap action messages ("On my way now", "Arrived outside", "Delivered safely").
- **Accessibility Toggle:** High-contrast large-font mode designed for elderly community members.
- **Community Resolution Archive:** Public neighbourhood archive documenting verified completed tasks with summaries and thank-you ratings.

---

## Nexconn Chat SDK Features Used

1. **`NCEngine.initialize`**: Initializes the client engine with data center routing (`AreaCode.SG`) and logging configuration.
2. **`NCEngine.connect({ token })`**: Authenticates users using server-minted tokens from our backend.
3. **`NCEngine.addConnectionStatusHandler`**: Tracks connection state and displays live presence indicators.
4. **`DirectChannel` & `DirectChannelIdentifier`**: Powers dedicated 1-on-1 ticket communication channels between requesters and volunteers.
5. **`channel.sendMessage(new SendTextMessageParams({ text }))`**: Sends real-time chat messages and dispatch status notifications.
6. **`NCEngine.addMessageHandler`**: Delivers instant inbound messages directly to active chat timelines.
7. **`channel.sendTypingStatus('RC:TxtMsg')` & `ChannelHandler.onTypingStatusChanged`**: Live typing notifications showing when the peer is drafting a response.
8. **`channel.clearUnreadCount()` & `ChannelHandler.onChannelStatusSyncCompleted`**: Clears unread counts and synchronizes read status.
9. **`BaseChannel.createMessagesQuery`**: Retrieves message history when returning to existing dispatch rooms.
10. **Platform Chat API (`POST /v4/auth/access-token/issue`)**: Server-side request signing using SHA1(`AppSecret + Nonce + Timestamp`) for secure token minting.

---

## Architecture

```
[ Browser Client A (Requester) ]           [ Browser Client B (Volunteer) ]
        |                                                 |
        |--- (1) Auth & Get Token ------------------------|
        v                                                 v
  [ Express Backend Server ] <---> [ Nexconn Platform Chat API ]
   • Issues signed tokens via SHA1  • https://api.sg-light-api.com
   • Manages ticket state           • Validates credentials & issues JWT
        |                                                 |
        +======== (2) Real-Time WebSocket Connect ========+
                                  |
                                  v
                      [ Nexconn Chat Engine ]
                       • DirectChannel routing
                       • Instant message delivery
                       • Typing status & read sync
```

---

## Local Setup

### 1. Prerequisites
- Node.js v18 or higher
- npm or pnpm

### 2. Clone and Install
```bash
git clone https://github.com/venkat200709/relay-nexconn.git
cd relay-nexconn
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```env
NEXCONN_APP_KEY=e0x9wycferqnq
NEXCONN_APP_SECRET=your_app_secret_here
NEXCONN_DATA_CENTER=Singapore
NEXCONN_API_HOST=api.sg-light-api.com
PORT=3001
```

### 4. Run Development Server
```bash
# Starts both Express backend (port 3001) and Vite frontend (port 5173)
npm run dev
```

Open `http://localhost:5173` in two browser windows (or one incognito window) to test real-time chat between a Requester and a Volunteer.

---

## Early User Feedback (Traction Proof)

Team Hexcore piloted Relay with **22 early community testers** across the Chennai Institute of Technology (CIT) campus and neighboring residential apartment clusters in November 2026.

| Tester Profile | Scenario Tested | Observed Benefit | Feedback Rating |
| :--- | :--- | :--- | :---: |
| **Senior Resident (Age 68)** | Emergency prescription medicine pickup | Hands-free voice dictation & large-font toggle eliminated typing fatigue. | **5.0 / 5.0** |
| **Student Resident (CIT Hostel)** | Late-night library-to-hostel transport | Immediate volunteer assignment notification; zero personal phone numbers exposed. | **4.8 / 5.0** |
| **Residential Community Volunteer** | Essential grocery drop-off | "In Progress" status progression & quick-reply action chips kept both parties aligned. | **4.9 / 5.0** |
| **Campus Mutual Aid Volunteer** | Exam note & calculator drop-off | Dedicated 1-on-1 Nexconn chat kept mutual aid completely free from group spam. | **4.9 / 5.0** |

See full pilot breakdown and methodology in [TRACTION.md](TRACTION.md).

---

## What Was Hard & What We Learned

Integrating a real-time SDK into a dispatch workflow required rethinking state ownership. In traditional chat apps, channels are tied to user contacts. In Relay, chat channels are ephemeral workspaces tied to real-world tasks. 

Our main technical hurdle was token generation and credential isolation. To follow strict security rules, our backend signs requests using SHA1 with nonces and millisecond timestamps against Nexconn's Singapore platform API before returning access tokens to the browser. 

We also learned how crucial small feedback cues are in emergency scenarios. When an elderly resident asks for medicine, seeing "Volunteer is typing..." and "Status: In Progress" removes the anxiety of wondering if anyone is coming.

---

## Team Hexcore

- **Venkatesan Neelakandan** (`venkatesann.cse2025@citchennai.net`): SDK integration, backend token generation, architecture, deployment, and submission.
- **Sasmita Shree P** (`sasmitashreep.cse2025@citchennai.net`): UI design, responsiveness testing, edge-case validation, and traction outreach.
