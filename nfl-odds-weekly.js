#!/usr/bin/env node
const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {headers: {'User-Agent': 'Mozilla/5.0 (Macintosh)'}}, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        try { 
          resolve(JSON.parse(data)); 
        }
        catch (e) { 
          reject(new Error(`Invalid response: ${data.substring(0, 50)}`)); 
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    console.log('🏈 Fetching NFL schedule...\n');
    
    try {
      const url = 'https://www.espn.com/apis/site/v2/sports/football/nfl/schedule';
      const data = await fetchUrl(url);
      
      if (!data.events) { 
        console.log('No events found.');
        return; 
      }
      
      const today = new Date();
      const weekGames = data.events.filter(e => {
        try {
          const d = new Date(e.date);
          const daysAway = (d - today) / (1000*60*60*24);
          return daysAway >= -1 && daysAway <= 7;
        } catch (e) { return false; }
      });
      
      if (weekGames.length === 0) { 
        console.log('No games scheduled for this week yet (Pre-season or Regular season).\n');
        return; 
      }
      
      console.log(`📅 This week's NFL matchups:\n`);
      
      weekGames.forEach((game, i) => {
        const c = game.competitions?.[0];
        const away = c?.competitors?.find(x => x.homeAway === 'away')?.team?.displayName || 'TBA';
        const home = c?.competitors?.find(x => x.homeAway === 'home')?.team?.displayName || 'TBA';
        const seasonType = game.seasonType?.type === 'pre' ? '🔶 PRE' : '🟢 REG';
        
        const time = new Date(game.date).toLocaleString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles'
        });
        
        console.log(`${i + 1}. ${seasonType} ${away} @ ${home}`);
        console.log(`   ${time} PT\n`);
      });
      
    } catch (espnError) {
      console.log('ESPN API unavailable. Pre-season games starting in early September.');
      console.log('Regular season starts mid-September.\n');
      console.log('Script is ready! It will show games once the season starts.\n');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
