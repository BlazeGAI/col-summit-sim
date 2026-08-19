export const scenario = {
  title: "Blackridge Expedition",
  subtitle: "Get the team off the mountain before the storm closes the pass.",
  context: "A fast-moving mountain storm has cut off the normal evacuation route. Your six-person expedition must make four high-stakes decisions using limited food, equipment, medicine, morale, and map knowledge. Every choice changes what the team will have available later.",
  rules: [
    "Work as one team. Your shared objective is to get everyone off Blackridge.",
    "Each player has a private role and a soft personal incentive. Advocate for it, but do not read it aloud or show your phone.",
    "Discuss the situation before voting. Do not begin a round by simply polling the group.",
    "Each player submits one individual decision on their phone. Your choice does not have to match the group.",
    "The option receiving the most votes becomes the team's action. The host then reveals the consequence.",
    "Resources carry forward from round to round. A safe decision now can create a shortage later.",
    "Role points recognize how well you advanced your private objective. Team survival still matters more than individual rank."
  ],
  maxRounds: 4,
  players: [
    { name: "Korab", role: "Expedition Lead", motive: "Favor decisive action. Earn a bonus when the team avoids a tie." },
    { name: "Bri", role: "Operations Chief", motive: "Protect shared supplies. Earn a bonus if food remains above 4." },
    { name: "Vicki", role: "Risk Adviser", motive: "Push the team to investigate. Earn a bonus when the team selects a cautious option." },
    { name: "Jeff", role: "Quartermaster", motive: "Keep equipment in use. Earn a bonus when at least 3 tools are committed in a round." },
    { name: "Sree", role: "Navigator", motive: "Favor routes that gain map knowledge. Earn a bonus when map knowledge reaches 3." },
    { name: "Mike", role: "Silent Observer", motive: "You may speak only once per round. Earn a bonus when your submitted choice matches the final team choice." }
  ],
  initialResources: { food: 10, matches: 8, rope: 5, medicine: 4, morale: 7, map: 0 },
  rounds: [
    {
      title: "The Washed-Out Bridge",
      briefing: "The only marked bridge is gone. A narrow gorge separates the team from the ranger road.",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80",
      options: [
        { id: "build", label: "Build a rope crossing", description: "Fast, equipment-heavy, moderate risk.", result: "The team rigs a narrow rope crossing and gets everyone over the gorge before the water rises further. The shortcut saves time, but the expedition has used most of its rope and the crossing rattles everyone's nerves.", cost: { rope: 3, morale: 1 }, score: 18, tags: ["decisive"] },
        { id: "detour", label: "Take the forest detour", description: "Slower, consumes food, reveals terrain.", result: "The detour costs precious daylight and food, but the team discovers old trail markers and gains a clearer understanding of the terrain ahead. You reach the ranger road without risking the gorge.", cost: { food: 3, map: -1 }, score: 15, tags: ["cautious", "map"] },
        { id: "search", label: "Search for another crossing", description: "Conserves equipment, but the storm advances.", result: "After a long search, the team finds a shallow upstream crossing. You preserve the rope and learn more about the surrounding terrain, but the delay costs food, morale, and valuable time as the storm closes in.", cost: { food: 2, morale: 2, map: -2 }, score: 12, tags: ["cautious", "map"] }
      ]
    },
    {
      title: "The Injured Hiker",
      briefing: "A stranded hiker has a severe ankle injury and says another party is missing uphill.",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=80",
      options: [
        { id: "escort", label: "Escort the hiker down", description: "Safer and humane, but costs time and food.", result: "The team escorts the injured hiker to a safer junction and leaves clear information for rescuers. The choice costs supplies and time, but the group knows the hiker is no longer alone in worsening conditions.", cost: { food: 2, medicine: 1, morale: 2 }, score: 20, tags: ["cautious"] },
        { id: "stabilize", label: "Stabilize and mark the location", description: "Preserves momentum while providing aid.", result: "You splint the injury, leave the hiker sheltered, and mark the location for rescuers. The team keeps moving, but leaving someone behind creates unease even though the route remains open.", cost: { medicine: 2, rope: 1, morale: 1 }, score: 17, tags: ["decisive"] },
        { id: "split", label: "Split into two groups", description: "Covers more ground, but coordination suffers.", result: "Splitting the expedition covers more terrain and produces useful route information, but communication breaks down. The groups reunite later than planned, tired and frustrated by the coordination risk.", cost: { food: 1, morale: 3, map: -1 }, score: 10, tags: ["map"] }
      ]
    },
    {
      title: "Nightfall at the Fire Tower",
      briefing: "The abandoned fire tower offers shelter. The radio is damaged, and temperatures are dropping.",
      image: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1400&q=80",
      options: [
        { id: "repair", label: "Repair the radio", description: "Use tools and matches to attempt contact.", result: "After several tense attempts, the radio crackles to life long enough to transmit your position. You cannot be sure the message was received, but the possibility of contact changes the team's odds significantly.", cost: { matches: 2, rope: 1, morale: 1 }, score: 22, tags: ["decisive"] },
        { id: "signal", label: "Build a signal fire", description: "Highly visible, but expensive in matches.", result: "The signal fire burns bright above the tree line and may be visible from the valley. It also consumes a large share of your remaining matches, leaving fewer options if you must spend another night outside.", cost: { matches: 4, food: 1, morale: 1 }, score: 19, tags: ["decisive"] },
        { id: "rest", label: "Shelter and rest", description: "Restores morale but loses rescue time.", result: "The team shelters inside the tower, eats, and gets several hours of badly needed rest. Morale improves, but no rescue signal is sent and the storm is noticeably stronger by morning.", cost: { food: 2, morale: -2 }, score: 14, tags: ["cautious"] }
      ]
    },
    {
      title: "The Final Descent",
      briefing: "The storm is here. One route is steep and direct. The other is longer but partly mapped.",
      image: "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=1400&q=80",
      options: [
        { id: "ridge", label: "Take the direct ridge", description: "Fastest route. Requires rope and strong morale.", result: "The direct ridge is punishing, exposed, and fast. The team uses rope to negotiate the steepest section and reaches lower ground before the storm fully blocks the descent.", cost: { rope: 2, food: 1, morale: 2 }, score: 25, tags: ["decisive"] },
        { id: "valley", label: "Follow the valley", description: "Longer, safer, and improved by map knowledge.", result: "The valley route takes longer but offers protection from the worst wind. Your accumulated terrain knowledge helps the team avoid several dead ends and steadily work toward safety.", cost: { food: 3, matches: 1, morale: 1 }, score: 20, tags: ["cautious", "map"] },
        { id: "hold", label: "Hold position for rescue", description: "Preserves movement risk but depends on visibility.", result: "The team builds the strongest shelter it can and waits. Movement risk is reduced, but rescue now depends on visibility, earlier signals, and whether your remaining supplies last through the storm.", cost: { food: 2, matches: 2, morale: 2 }, score: 13, tags: ["cautious"] }
      ]
    }
  ]
};
