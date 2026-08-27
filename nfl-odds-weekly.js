#!/usr/bin/env node

const https = require('https');

function httpsRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Failed to parse response'));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('🏈 Fetching NFL schedule...\n');
    
    const data = await httpsRequest('https://site.api.espn.com/apis/site/v2/sports/football/nfl/schedule');
    
    if (!data.events || data.events.length === 0) {
      console.log('No games found this week.');
      return;
    }
    
    const today = new Date();
    const weekGames = data.events.filter(game => {
      const gameDate = new Date(game.date);
      const daysUntilGame = (gameDate - today) / (1000 * 60 * 60 * 24);
      return daysUntilGame >= 0 && daysUntilGame <= 7;
    });
    
    if (weekGames.length === 0) {
      console.log('No games scheduled this week.');
      return;
    }
    
    console.log(`📅 ${weekGames.length} games this week:\n`);
    
    weekGames.forEach((game, i) => {
      const comp = game.competitions?.[0];
      const away = comp?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName || 'TBD';
      const home = comp?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName || 'TBD';
      const gameTime = new Date(game.date).toLocaleString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles'
      });
      
      console.log(`${i + 1}. ${away} @ ${home}`);
      console.log(`   ${gameTime} PT\n`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
