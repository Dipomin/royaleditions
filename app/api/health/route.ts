import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const uptime = typeof process !== 'undefined' && typeof process.uptime === 'function' ? process.uptime() : null;
  const env = process.env.NODE_ENV || null;
  let release = null;
  try {
    const symlink = path.resolve(process.cwd(), '.next/standalone');
    if (fs.existsSync(symlink)) {
      const target = fs.realpathSync(symlink);
      release = path.basename(target);
    }
  } catch (e) {
    // ignore
  }

  return NextResponse.json({
    status: 'ok',
    uptime,
    env,
    release,
    ts: Date.now()
  });
}
