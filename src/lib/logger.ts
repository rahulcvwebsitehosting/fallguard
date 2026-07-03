type LogMeta = Record<string, unknown>;

function formatTimestamp(): string {
  return new Date().toISOString();
}

export function info(msg: string, meta?: LogMeta) {
  if (meta) {
    try {
      console.log(`[${formatTimestamp()}] [INFO] ${msg}`, JSON.stringify(meta));
    } catch {
      console.log(`[${formatTimestamp()}] [INFO] ${msg}`);
    }
  } else {
    console.log(`[${formatTimestamp()}] [INFO] ${msg}`);
  }
}

export function warn(msg: string, meta?: LogMeta) {
  if (meta) {
    try {
      console.warn(`[${formatTimestamp()}] [WARN] ${msg}`, JSON.stringify(meta));
    } catch {
      console.warn(`[${formatTimestamp()}] [WARN] ${msg}`);
    }
  } else {
    console.warn(`[${formatTimestamp()}] [WARN] ${msg}`);
  }
}

export function error(msg: string, meta?: LogMeta) {
  if (meta) {
    try {
      console.error(`[${formatTimestamp()}] [ERROR] ${msg}`, JSON.stringify(meta));
    } catch {
      console.error(`[${formatTimestamp()}] [ERROR] ${msg}`);
    }
  } else {
    console.error(`[${formatTimestamp()}] [ERROR] ${msg}`);
  }
}