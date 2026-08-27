#!/usr/bin/env node

const https = require('https');

function httpsRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response'));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('🏈 Fetching NFL schedule...\n');
    
    const url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/schedule';
    const data = await httpsRequest(url);
    
    if (!data || !data.events) {
      console.log('No schedule data available.');
      process.exit(0);
    }
    
    const today = new Date();
    const weekGames = data.events.filter(game => {
      try {
        const gameDate = new Date(game.date);
        const daysUntilGame = (gameDate - today) / (1000 * 60 * 60 * 24);
        return daysUntilGame >= 0 && daysUntilGame <= 7;
      } catch (e) {
        return false;
      }
    });
    
    if (weekGames.length === 0) {
      console.log('No games this week.');
      process.exit(0);
    }
    
    console.log(`📅 This week's NFL matchups (${weekGames.length} games):\n`);
    
    weekGames.forEach((game, idx) => {
      try {
        const comp = game.competitions?.[0];
        const away = comp?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName;
        const home = comp?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName;
        const time = new Date(game.date).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'America/Los_Angeles'
        });
        
        console.log(`${idx + 1}. ${away} @ ${home}`);
        console.log(`   ${time} PT\n`);
      } catch (e) {
        console.log(`${idx + 1}. Game data error\n`);
      }
    });
    
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
