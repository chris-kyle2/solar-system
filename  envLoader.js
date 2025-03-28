const fs = require('fs');
const path = '/mnt/env_vars';

if (fs.existsSync(path)) {
  const envVars = fs.readFileSync(path, 'utf-8').split('\n');
  envVars.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
  console.log("Environment variables loaded successfully.");
} else {
  console.error('Environment variables file not found at /mnt/env_vars');
  process.exit(1);
}
