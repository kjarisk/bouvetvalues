// Leaderboard management using localStorage

export const getLeaderboard = () => {
  const stored = localStorage.getItem('bouvetArcadeLeaderboard');
  return stored ? JSON.parse(stored) : [];
};

export const addScore = (playerName, score, game) => {
  const leaderboard = getLeaderboard();
  
  // Find if player exists
  const existingPlayerIndex = leaderboard.findIndex(
    entry => entry.name.toLowerCase() === playerName.toLowerCase()
  );
  
  if (existingPlayerIndex >= 0) {
    // Update existing player's total score
    leaderboard[existingPlayerIndex].totalScore += score;
    leaderboard[existingPlayerIndex].games[game] = 
      Math.max(leaderboard[existingPlayerIndex].games[game] || 0, score);
  } else {
    // Add new player
    leaderboard.push({
      name: playerName,
      totalScore: score,
      games: { [game]: score }
    });
  }
  
  // Sort by total score
  leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  
  // Keep top 10
  const top10 = leaderboard.slice(0, 10);
  
  localStorage.setItem('bouvetArcadeLeaderboard', JSON.stringify(top10));
  
  return top10;
};

export const clearLeaderboard = () => {
  localStorage.removeItem('bouvetArcadeLeaderboard');
};

