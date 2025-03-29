// const fs = require('fs');
// const path = '/mnt/env_vars';

// if (fs.existsSync(path)) {
//   const envVars = fs.readFileSync(path, 'utf-8').split('\n');
//   envVars.forEach(line => {
//     const [key, value] = line.split('=');
//     if (key && value) process.env[key.trim()] = value.trim();
//   });
//   console.log("Environment variables loaded successfully.");
// } else {
//   console.error('Environment variables file not found at /mnt/env_vars');
//   process.exit(1);
// }

// const fs = require('fs');
// const path = '/mnt/env_vars';

// if (fs.existsSync(path)) {
//   console.log("📂 Detected Kubernetes secret mount at /mnt/env_vars. Loading variables...");

//   // Read all files in the secret mount directory
//   fs.readdirSync(path).forEach(file => {
//     const value = fs.readFileSync(`${path}/${file}`, 'utf-8').trim();
//     process.env[file] = value; // Set each file content as an environment variable
//   });

//   console.log("✅ Environment variables loaded from secret mount.");
// } else {
//   console.log("🔄 No Kubernetes secret mount found. Using existing environment variables.");
// }


const fs = require('fs');
const path = '/mnt/env_vars';

if (fs.existsSync(path)) {
  const stats = fs.lstatSync(path);

  // 🏗 Check if it's a folder (Kubernetes secrets are mounted as files)
  if (stats.isDirectory()) {
    console.log("📂 Detected Kubernetes secret mount. Loading environment variables...");
    fs.readdirSync(path).forEach(file => {
      const filePath = `${path}/${file}`;
      if (fs.lstatSync(filePath).isFile()) {
        const value = fs.readFileSync(filePath, 'utf-8').trim();
        process.env[file] = value;
      }
    });
    console.log("✅ Environment variables loaded from Kubernetes secrets.");
  }

  // 📜 If it's a file, assume it's a Docker volume (CI/CD)
  else if (stats.isFile()) {
    console.log("📜 Found a single env file at /mnt/env_vars. Parsing...");
    const envVars = fs.readFileSync(path, 'utf-8').split('\n');
    envVars.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) process.env[key.trim()] = value.trim();
    });
    console.log("✅ Environment variables loaded from Docker volume.");
  }
} else {
  console.error('❌ Environment variables file/directory not found at /mnt/env_vars');
  process.exit(1);
}

