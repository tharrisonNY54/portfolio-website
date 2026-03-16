import fs from 'fs';
import path from 'path';

export async function getFolders(basePath: string) {
  console.log(basePath)
  const res = await fetch(basePath)
  if (!res.ok) {
    throw new Error('Failed to fetch')
  }
  const data = await res.json();
  return data
}

// export function getSessions(basePath: string, projectName: string) {
//   const projectPath = path.join(process.cwd(), basePath, projectName);
//   return fs.readdirSync(projectPath).filter(item =>
//     fs.statSync(path.join(projectPath, item)).isDirectory()
//   );
// }

export function getFiles(basePath: string, projectName: string, sessionName: string) {
  const sessionPath = path.join(process.cwd(), basePath, projectName, sessionName);
  return fs.readdirSync(sessionPath).filter(item =>
    fs.statSync(path.join(sessionPath, item)).isFile()
  );
}
