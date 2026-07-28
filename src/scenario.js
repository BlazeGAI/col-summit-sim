export const scenario = {
  title: "Blackridge Expedition",
  subtitle: "Get the team off the mountain before the storm closes the pass.",
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
        { id: "build", label: "Build a rope crossing", description: "Fast, equipment-heavy, moderate risk.", cost: { rope: 3, morale: 1 }, score: 18, tags: ["decisive"] },
        { id: "detour", label: "Take the forest detour", description: "Slower, consumes food, reveals terrain.", cost: { food: 3, map: -1 }, score: 15, tags: ["cautious", "map"] },
        { id: "search", label: "Search for another crossing", description: "Conserves equipment, but the storm advances.", cost: { food: 2, morale: 2, map: -2 }, score: 12, tags: ["cautious", "map"] }
      ]
    },
    {
      title: "The Injured Hiker",
      briefing: "A stranded hiker has a severe ankle injury and says another party is missing uphill.",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1400&q=80",
      options: [
        { id: "escort", label: "Escort the hiker down", description: "Safer and humane, but costs time and food.", cost: { food: 2, medicine: 1, morale: 2 }, score: 20, tags: ["cautious"] },
        { id: "stabilize", label: "Stabilize and mark the location", description: "Preserves momentum while providing aid.", cost: { medicine: 2, rope: 1, morale: 1 }, score: 17, tags: ["decisive"] },
        { id: "split", label: "Split into two groups", description: "Covers more ground, but coordination suffers.", cost: { food: 1, morale: 3, map: -1 }, score: 10, tags: ["map"] }
      ]
    },
    {
      title: "Nightfall at the Fire Tower",
      briefing: "The abandoned fire tower offers shelter. The radio is damaged, and temperatures are dropping.",
      image: "https://images.unsplash.com/photo-1473445361085-b9a07f55608b?auto=format&fit=crop&w=1400&q=80",
      options: [
        { id: "repair", label: "Repair the radio", description: "Use tools and matches to attempt contact.", cost: { matches: 2, rope: 1, morale: 1 }, score: 22, tags: ["decisive"] },
        { id: "signal", label: "Build a signal fire", description: "Highly visible, but expensive in matches.", cost: { matches: 4, food: 1, morale: 1 }, score: 19, tags: ["decisive"] },
        { id: "rest", label: "Shelter and rest", description: "Restores morale but loses rescue time.", cost: { food: 2, morale: -2 }, score: 14, tags: ["cautious"] }
      ]
    },
    {
      title: "The Final Descent",
      briefing: "The storm is here. One route is steep and direct. The other is longer but partly mapped.",
      image: "https://images.unsplash.com/photo-1486911278844-a81c5267e227?auto=format&fit=crop&w=1400&q=80",
      options: [
        { id: "ridge", label: "Take the direct ridge", description: "Fastest route. Requires rope and strong morale.", cost: { rope: 2, food: 1, morale: 2 }, score: 25, tags: ["decisive"] },
        { id: "valley", label: "Follow the valley", description: "Longer, safer, and improved by map knowledge.", cost: { food: 3, matches: 1, morale: 1 }, score: 20, tags: ["cautious", "map"] },
        { id: "hold", label: "Hold position for rescue", description: "Preserves movement risk but depends on visibility.", cost: { food: 2, matches: 2, morale: 2 }, score: 13, tags: ["cautious"] }
      ]
    }
  ]
};
