#!/usr/bin/env node

const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON'));
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('🏈 Fetching NFL schedule...\n');
    
    // Using ESPN's public schedule (no auth needed)
    const url = 'https://www.espn.com/apis/site/v2/sports/football/nfl/schedule';
    const data = await fetchUrl(url);
    
    if (!data.events || data.events.length === 0) {
      console.log('No events found.');
      return;
    }
    
    const today = new Date();
    const weekGames = data.events.filter(event => {
      try {
        const eventDate = new Date(event.date);
        const daysAway = (eventDate - today) / (1000 * 60 * 60 * 24);
        return daysAway >= -1 && daysAway <= 7;
      } catch (e) {
        return false;
      }
    });
    
    if (weekGames.length === 0) {
      console.log('No games this week.');
      return;
    }
    
    console.log(`📅 This week's NFL matchups:\n`);
    
    weekGames.forEach((game, i) => {
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
      
      console.log(`${i + 1}. ${away} @ ${home}`);
      console.log(`   ${time} PT\n`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
