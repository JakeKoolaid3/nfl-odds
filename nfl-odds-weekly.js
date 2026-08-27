#!/usr/bin/env node

/**
 * NFL Weekly Matchups & Odds Fetcher
 * Displays current week's NFL games with betting odds
 * 
 * Usage: node nfl-odds-weekly.js
 */

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
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function fetchNFLSchedule() {
  try {
    console.log('🏈 Fetching this week\'s NFL matchups...\n');
    
    const scheduleUrl = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/schedule';
    const data = await httpsRequest(scheduleUrl);
    
    if (!data.events) {
      console.log('No games found for this week.');
      return [];
    }
    
    const today = new Date();
    const weekGames = data.events.filter(game => {
      const gameDate = new Date(game.date);
      const daysUntilGame = (gameDate - today) / (1000 * 60 * 60 * 24);
      return daysUntilGame >= 0 && daysUntilGame <= 7;
    });
    
    return weekGames;
  } catch (error) {
    console.error('Error fetching NFL schedule:', error.message);
    return [];
  }
}

function formatGameTime(dateString) {
  const date = new Date(dateString);
  const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' };
  return date.toLocaleString('en-US', options);
}

async function main() {
  const games = await fetchNFLSchedule();
  
  if (games.length === 0) {
    console.log('No NFL games scheduled for this week.');
    process.exit(0);
  }
  
  console.log(`📅 ${games.length} games this week:\n`);
  console.log('═'.repeat(80));
  
  for (let i = 0; i <
