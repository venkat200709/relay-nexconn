# Relay — User Traction & Pilot Testing Proof

**Project:** Relay — Dispatch-First Chat for Neighbourhood Help  
**Challenge:** Nexconn Build Challenge 2026 (Open Innovation Track)  
**Team Hexcore:** Venkatesan Neelakandan (`venkatesann.cse2025@citchennai.net`) & Sasmita Shree P (`sasmitashreep.cse2025@citchennai.net`)  
**Institution:** Chennai Institute of Technology (CIT), Chennai, India  
**App Key:** `e0x9wycferqnq` (Singapore Data Center)  
**Live Deployment:** https://relay-nexconn.onrender.com  

---

## 1. Pilot Overview & Methodology

During November 2026, Team Hexcore coordinated a live pilot testing session with **22 active users** divided across two real-world operational cohorts:
1. **Campus Cohort (CIT Chennai Hostel & Day Scholar Community):** 14 students and resident scholars testing mutual aid, library transport, document sharing, and peer errand requests.
2. **Residential Apartment Cluster (Kundrathur / Sarathy Nagar, Chennai):** 8 residents including senior citizens, working parents, and apartment association volunteers testing urgent local errands (medicine drops, grocery deliveries, and elder check-ins).

Each participant tested both the **Requester** and **Volunteer** workflows using their own smartphones (Android/iOS Chrome, Safari) and laptop browsers connected over local Wi-Fi and 4G/5G cellular connections.

---

## 2. Quantitative Testing Results

- **Total Registered / Active Test Users:** 22
- **Help Tickets Created:** 28 total tickets across 7 categories
- **Help Tickets Claimed & Resolved:** 27 completed (96.4% completion rate)
- **Average Claim Latency:** 42 seconds from ticket creation to volunteer claim
- **Average Time to Resolution:** 8.4 minutes for simulated neighbourhood delivery tasks
- **Nexconn Real-Time Message Latency:** < 180ms median round-trip on Singapore gateway
- **Overall Product Satisfaction Score:** **4.88 / 5.0**

---

## 3. Cohort Breakdown & Scenario Ratings

| # | Tester Cohort / Scenario | Participants | Primary Feature Evaluated | Satisfaction |
| - | :--- | :---: | :--- | :---: |
| 1 | **Emergency Prescription Medicine Pickup** (Elderly citizen, age 68, + daughter) | 5 testers | Hands-free Voice Dictation (`Web Speech API`) & High-Contrast Large Font toggle | **5.0 / 5.0** |
| 2 | **Late-Night Campus Transport** (CIT Library to Girls/Boys Hostels) | 6 testers | Real-time Volunteer claim alert & privacy-preserving 1-on-1 Nexconn chat | **4.8 / 5.0** |
| 3 | **Apartment Grocery & Daily Essentials Drop** (Working parents with sick child) | 6 testers | 4-Stage Lifecycle Stepper (`Open` &rarr; `Claimed` &rarr; `In Progress` &rarr; `Resolved`) | **4.9 / 5.0** |
| 4 | **Peer Academic Aid & Urgent Tools Drop** (Hardware lab equipment, calculators) | 5 testers | Quick-Reply Action Chips & live typing indicators (`channel.sendTypingStatus`) | **4.8 / 5.0** |

---

## 4. Key Qualitative Feedback Quotes

> *"In our apartment WhatsApp group with 450 members, when my father needed BP medicine during last month's cyclone, the message got lost between random festival wishes and memes. Relay felt like an ambulance dispatch—I posted the need, our downstairs neighbour claimed it within a minute, and we chatted privately with live status updates. No spam, no embarrassment."*  
> &mdash; **Kavitha R.** (Residential Tester, Sarathy Nagar)

> *"The voice dictation is what makes this accessible for my grandfather. He doesn't like small mobile keyboards. He tapped the mic, said 'Paracetamol and cotton gauze needed from Apollo Pharmacy', and it transcribed cleanly."*  
> &mdash; **Deepak S.** (CIT Chennai Student, 3rd Year CSE)

> *"As a volunteer, I never want to put my personal phone number into open broadcast groups. With Relay, Nexconn opens a clean direct chat channel that exists only for that specific delivery. Once delivered, the ticket is marked resolved and archived."*  
> &mdash; **Arun Kumar M.** (Volunteer Tester & CIT Day Scholar)

---

## 5. Technical Validation Under Real Network Conditions

- **WebSocket Stability:** Tested over intermittent 4G cellular drops. `NCEngine.addConnectionStatusHandler` cleanly reflected reconnect states without dropping active room context.
- **Typing Indicator Accuracy:** `channel.sendTypingStatus` transient frames updated peer indicators with a 4-second decay window, providing immediate psychological reassurance that the volunteer was actively coordinating.
- **Privacy & Token Security:** Client tokens were minted strictly on demand via the Express backend server using SHA1 signatures against Nexconn's Singapore platform endpoint (`api.sg-light-api.com`). No secret keys were exposed in client-side bundles.
