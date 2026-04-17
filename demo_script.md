# InsureRoute: Hackathon Demo Video Script

**Target Length:** 2.5 to 3 Minutes  
**Tone:** Professional, Tech-Forward, Problem-Solution Oriented  
**Formatting:** [VISUAL] indicates what to show on screen. [VO] indicates the Voice Over script.

---

## Part 1: The Problem & Introduction (0:00 - 0:30)

**[VISUAL]** 
*Start with a stark title slide or a fast B-roll montage of container ships, heavy rain on highways, or gridlocked trucks.*
*Cut to a clean title card: "InsureRoute: Predictive Routing. Dynamic Hedging."*

**[VO]**
"Modern global supply chains are incredibly fragile. A sudden local storm or an unpredicted traffic jam can cause millions of dollars in damages to sensitive cargo. 
But the biggest problem isn't just the delay—it's the insurance. 
Currently, cargo insurance is static. If a driver takes a highly dangerous, flooded route, they pay the same premium as if they took a clear highway. 
At InsureRoute, we're fixing this by bridging predictive routing with dynamic financial hedging."

---

## Part 2: The Baseline Operations (0:30 - 1:00)

**[VISUAL]** 
*Screen recording begins. Show the main InsureRoute React dashboard in its default, "Safe" state.*
*Mouse hovers over the KPI cards at the top (SLA, Risk Percentage).*
*Mouse traces the default route currently drawn in blue/green on the Network Graph.*

**[VO]**
"Welcome to the InsureRoute command center. 
Here, we simulate real-time logistics networks. Right now, conditions are perfectly normal. Our telemetry shows low disruption risk, solid SLA compliance, and our Routing Engine has plotted the most direct, standard path for our cargo from origin to destination.
On the right, you'll see our Actuarial Pricing Engine has calculated a standard base premium for this trip."

---

## Part 3: The Catalyst / Injecting Disruption (1:00 - 1:45)

**[VISUAL]** 
*Zoom in slightly on the Top Navigation or Control Panel.*
*Mouse clicks the toggles to activate "Monsoon Conditions" and checks "Perishable Cargo".*
*Mouse physically clicks the big "Inject Disruption" button.*
*The screen immediately changes. KPI cards flash amber/red. An 'Anomaly Detected' warning appears.*

**[VO]**
"But logistics is never perfect. Let's introduce a massive variable. We're loading a highly perishable shipment during severe monsoon conditions. 
When we inject this disruption into the system, watch what happens.
Instantly, our Scikit-Learn Isolation Forest model flags an severe statistical anomaly. Our system knows that historically, this exact combination of weather and cargo type on this specific route leads to catastrophic failure."

---

## Part 4: The Intelligent Rerouting (1:45 - 2:15)

**[VISUAL]** 
*Focus heavily on the Network Map. Show the red X or red strike through the original path.*
*Trace the new glowing green path that bypasses the danger zone.*
*Mouse scrolls down briefly to the Logs Panel to show the raw backend JSON output proving the API is doing the heavy lifting.*

**[VO]**
"Instead of simply warning the dispatcher that a delay has happened, InsureRoute acts predictability. 
The backend immediately penalizes the compromised geographical edge in memory. It then executes Dijkstra's algorithm via NetworkX to self-heal the network, finding a slightly longer, but substantially safer, alternate route."

---

## Part 5: The Financial Resolution (2:15 - 2:45)

**[VISUAL]** 
*Zoom in sharply on the Insurance / Pricing Sidebar on the right.*
*Highlight the "Cost Before Action" (which should be very high).*
*Highlight the "Cost After Action" and the "Savings / X% Saved" metric in green.*

**[VO]**
"And here is our ultimate innovation. 
Because we avoided the high-risk zone, our actuarial engine dynamically recalculates the insurance hedge in real-time. 
If the shipper had taken the original route, their insurance liability would have spiked immensely due to the severe weather risk. By taking our predictive bypass, the capital risk drops drastically. We save the cargo, we save the SLA, and we immediately save the company a massive percentage on their premium."

---

## Part 6: Conclusion (2:45 - 3:00)

**[VISUAL]** 
*Pull out to show the entire dashboard working smoothly on the new route.*
*Fade to black with the InsureRoute Logo, tech stack icons (React, Python, Scikit-Learn, FastAPI), and Team Name.*

**[VO]**
"InsureRoute transforms logistics networks from reactive to predictive. By bringing mathematical routing and financial logic together into one seamless, lightning-fast dashboard, we aren't just mapping the supply chain—we're actively protecting it. 
Thank you."
