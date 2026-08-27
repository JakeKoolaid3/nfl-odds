#!/usr/bin/env node

const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Parse error'));
        }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });
}

async function main() {
  try {
    console.log('🏈 Fetching NFL matchups...\n');
    
    // Using NFLDATA.com which is more permissive
    const url = 'https://nfldata.com/api/v1/games?season=2026&season_type=REG';
    const data = await fetchUrl(url);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log('No games found.');
      return;
    }
    
    // Filter for upcoming games (next 7 days)
    const today = new Date();
    const weekGames = data.filter(game => {
      try {
        const gameDate = new Date(game.gameday);
        const daysAway = (gameDate - today) / (1000 * 60 * 60 * 24);
        return daysAway >= 0 && daysAway <= 7;
      } catch (e) {
        return false;
      }
    });
    
    if (weekGames.length === 0) {
      console.log('No games this week.');
      return;
    }
    
    console.log(`This week's matchups (${weekGames.length} games):\n`);
    
    weekGames.forEach((game, i) => {
      const time = new Date(game.gameday).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/Los_Angeles'
      });
      
      console.log(`${i + 1}. ${game.away_team} @ ${game.home_team}`);
      console.log(`   ${time} PT\n`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
