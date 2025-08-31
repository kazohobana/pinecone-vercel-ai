
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import os from 'os';

const execAsync = promisify(exec);

export interface SystemResources {
  cpu: {
    cores: number;
    usage: number;
    model: string;
    speed: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  storage: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  network: {
    interfaces: string[];
    uptime: number;
  };
  gpu?: {
    name: string;
    memory: number;
    utilization: number;
  };
}

export class SystemMonitor {
  static async getCpuInfo(): Promise<SystemResources['cpu']> {
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    
    // Calculate CPU usage percentage
    const usage = Math.min(100, (loadAvg[0] / cpus.length) * 100);
    
    return {
      cores: cpus.length,
      usage: Math.round(usage * 100) / 100,
      model: cpus[0]?.model || 'Unknown',
      speed: cpus[0]?.speed || 0
    };
  }

  static async getMemoryInfo(): Promise<SystemResources['memory']> {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const percentage = (used / total) * 100;

    return {
      total: Math.round(total / 1024 / 1024 / 1024 * 100) / 100, // GB
      free: Math.round(free / 1024 / 1024 / 1024 * 100) / 100, // GB
      used: Math.round(used / 1024 / 1024 / 1024 * 100) / 100, // GB
      percentage: Math.round(percentage * 100) / 100
    };
  }

  static async getStorageInfo(): Promise<SystemResources['storage']> {
    try {
      const { stdout } = await execAsync('df -h / | tail -1');
      const parts = stdout.trim().split(/\s+/);
      
      if (parts.length >= 4) {
        const total = this.parseStorageSize(parts[1]);
        const used = this.parseStorageSize(parts[2]);
        const free = this.parseStorageSize(parts[3]);
        const percentage = (used / total) * 100;

        return {
          total: Math.round(total * 100) / 100,
          used: Math.round(used * 100) / 100,
          free: Math.round(free * 100) / 100,
          percentage: Math.round(percentage * 100) / 100
        };
      }
    } catch (error) {
      console.error('Error getting storage info:', error);
    }

    return {
      total: 0,
      used: 0,
      free: 0,
      percentage: 0
    };
  }

  static async getNetworkInfo(): Promise<SystemResources['network']> {
    const interfaces = Object.keys(os.networkInterfaces());
    const uptime = os.uptime();

    return {
      interfaces,
      uptime: Math.round(uptime)
    };
  }

  static async getGpuInfo(): Promise<SystemResources['gpu'] | undefined> {
    try {
      // Try to get NVIDIA GPU info
      const { stdout } = await execAsync('nvidia-smi --query-gpu=name,memory.total,utilization.gpu --format=csv,noheader,nounits 2>/dev/null || echo ""');
      
      if (stdout.trim()) {
        const parts = stdout.trim().split(',');
        if (parts.length >= 3) {
          return {
            name: parts[0].trim(),
            memory: parseInt(parts[1].trim()) || 0,
            utilization: parseInt(parts[2].trim()) || 0
          };
        }
      }
    } catch (error) {
      // GPU info not available
    }

    return undefined;
  }

  static parseStorageSize(sizeStr: string): number {
    const size = parseFloat(sizeStr);
    const unit = sizeStr.slice(-1).toUpperCase();
    
    switch (unit) {
      case 'K': return size / 1024 / 1024;
      case 'M': return size / 1024;
      case 'G': return size;
      case 'T': return size * 1024;
      default: return size / 1024 / 1024 / 1024; // Assume bytes
    }
  }

  static async getAllSystemResources(): Promise<SystemResources> {
    const [cpu, memory, storage, network, gpu] = await Promise.all([
      this.getCpuInfo(),
      this.getMemoryInfo(),
      this.getStorageInfo(),
      this.getNetworkInfo(),
      this.getGpuInfo()
    ]);

    return {
      cpu,
      memory,
      storage,
      network,
      ...(gpu && { gpu })
    };
  }
}
