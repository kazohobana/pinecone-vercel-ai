
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';

export interface OpenSourceModel {
  id: string;
  name: string;
  source: 'huggingface' | 'pytorch' | 'tensorflow';
  modelType: 'llm' | 'vision' | 'audio' | 'multimodal';
  size: number; // in MB
  parameters: string; // e.g., "7B", "13B", "70B"
  downloadUrl: string;
  configUrl?: string;
  tokenizerUrl?: string;
  license: string;
  description: string;
  requirements: {
    minCpuCores: number;
    minGpuMemory: number;
    minRamGb: number;
  };
}

export class ModelRepository {
  private modelsDir = path.join(process.cwd(), 'models');
  private availableModels: OpenSourceModel[] = [
    {
      id: 'llama2-7b',
      name: 'LLaMA 2 7B',
      source: 'huggingface',
      modelType: 'llm',
      size: 13000,
      parameters: '7B',
      downloadUrl: 'https://huggingface.co/meta-llama/Llama-2-7b-hf/resolve/main/pytorch_model.bin',
      configUrl: 'https://huggingface.co/meta-llama/Llama-2-7b-hf/resolve/main/config.json',
      tokenizerUrl: 'https://huggingface.co/meta-llama/Llama-2-7b-hf/resolve/main/tokenizer.json',
      license: 'Custom (Meta)',
      description: 'Meta\'s LLaMA 2 7B parameter language model',
      requirements: {
        minCpuCores: 8,
        minGpuMemory: 16,
        minRamGb: 32
      }
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      source: 'huggingface',
      modelType: 'llm',
      size: 14000,
      parameters: '7B',
      downloadUrl: 'https://huggingface.co/mistralai/Mistral-7B-v0.1/resolve/main/pytorch_model.bin',
      configUrl: 'https://huggingface.co/mistralai/Mistral-7B-v0.1/resolve/main/config.json',
      tokenizerUrl: 'https://huggingface.co/mistralai/Mistral-7B-v0.1/resolve/main/tokenizer.json',
      license: 'Apache 2.0',
      description: 'Mistral AI\'s 7B parameter language model',
      requirements: {
        minCpuCores: 8,
        minGpuMemory: 14,
        minRamGb: 28
      }
    },
    {
      id: 'stable-diffusion-v2',
      name: 'Stable Diffusion v2.1',
      source: 'huggingface',
      modelType: 'vision',
      size: 5000,
      parameters: '860M',
      downloadUrl: 'https://huggingface.co/stabilityai/stable-diffusion-2-1/resolve/main/v2-1_512-ema-pruned.ckpt',
      configUrl: 'https://huggingface.co/stabilityai/stable-diffusion-2-1/resolve/main/v2-inference.yaml',
      license: 'CreativeML Open RAIL++',
      description: 'Stability AI\'s text-to-image diffusion model',
      requirements: {
        minCpuCores: 4,
        minGpuMemory: 8,
        minRamGb: 16
      }
    },
    {
      id: 'whisper-large',
      name: 'Whisper Large',
      source: 'huggingface',
      modelType: 'audio',
      size: 3000,
      parameters: '1.5B',
      downloadUrl: 'https://huggingface.co/openai/whisper-large-v2/resolve/main/pytorch_model.bin',
      configUrl: 'https://huggingface.co/openai/whisper-large-v2/resolve/main/config.json',
      license: 'MIT',
      description: 'OpenAI\'s Whisper speech recognition model',
      requirements: {
        minCpuCores: 4,
        minGpuMemory: 4,
        minRamGb: 8
      }
    },
    {
      id: 'codellama-7b',
      name: 'Code Llama 7B',
      source: 'huggingface',
      modelType: 'llm',
      size: 13000,
      parameters: '7B',
      downloadUrl: 'https://huggingface.co/codellama/CodeLlama-7b-hf/resolve/main/pytorch_model.bin',
      configUrl: 'https://huggingface.co/codellama/CodeLlama-7b-hf/resolve/main/config.json',
      tokenizerUrl: 'https://huggingface.co/codellama/CodeLlama-7b-hf/resolve/main/tokenizer.json',
      license: 'Custom (Meta)',
      description: 'Meta\'s Code Llama specialized for code generation',
      requirements: {
        minCpuCores: 8,
        minGpuMemory: 16,
        minRamGb: 32
      }
    }
  ];

  constructor() {
    this.ensureModelsDirectory();
  }

  private async ensureModelsDirectory() {
    try {
      await fs.access(this.modelsDir);
    } catch {
      await fs.mkdir(this.modelsDir, { recursive: true });
    }
  }

  async getAvailableModels(): Promise<OpenSourceModel[]> {
    return this.availableModels;
  }

  async getModelById(modelId: string): Promise<OpenSourceModel | null> {
    return this.availableModels.find(model => model.id === modelId) || null;
  }

  async downloadModel(modelId: string, onProgress?: (progress: number) => void): Promise<string> {
    const model = await this.getModelById(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    const modelDir = path.join(this.modelsDir, modelId);
    await fs.mkdir(modelDir, { recursive: true });

    // Download main model file
    const modelPath = path.join(modelDir, 'model.bin');
    await this.downloadFile(model.downloadUrl, modelPath, onProgress);

    // Download config if available
    if (model.configUrl) {
      const configPath = path.join(modelDir, 'config.json');
      await this.downloadFile(model.configUrl, configPath);
    }

    // Download tokenizer if available
    if (model.tokenizerUrl) {
      const tokenizerPath = path.join(modelDir, 'tokenizer.json');
      await this.downloadFile(model.tokenizerUrl, tokenizerPath);
    }

    // Create metadata file
    const metadataPath = path.join(modelDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(model, null, 2));

    return modelDir;
  }

  private async downloadFile(url: string, filePath: string, onProgress?: (progress: number) => void): Promise<void> {
    // For demo purposes, create a simulated model file instead of downloading from real URLs
    // In production, you would use actual model URLs from Hugging Face
    console.log(`Simulating download of ${url} to ${filePath}`);
    
    const simulatedSize = Math.floor(Math.random() * 1000) + 500; // 500-1500 MB
    const chunkSize = 10; // Simulate 10MB chunks
    let downloaded = 0;

    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    const fileStream = createWriteStream(filePath);
    
    // Simulate progressive download
    while (downloaded < simulatedSize) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
      
      const chunk = Buffer.alloc(chunkSize * 1024 * 1024, 'simulated-model-data'); // 10MB chunk
      fileStream.write(chunk);
      downloaded += chunkSize;
      
      if (onProgress) {
        onProgress(Math.min(100, (downloaded / simulatedSize) * 100));
      }
    }
    
    fileStream.end();
    
    // Wait for file to be written
    await new Promise((resolve, reject) => {
      fileStream.on('finish', resolve);
      fileStream.on('error', reject);
    });
    
    console.log(`Completed simulated download of ${path.basename(filePath)}`);
  }

  async isModelDownloaded(modelId: string): Promise<boolean> {
    try {
      const modelDir = path.join(this.modelsDir, modelId);
      const modelPath = path.join(modelDir, 'model.bin');
      await fs.access(modelPath);
      return true;
    } catch {
      return false;
    }
  }

  async getModelPath(modelId: string): Promise<string | null> {
    const isDownloaded = await this.isModelDownloaded(modelId);
    if (isDownloaded) {
      return path.join(this.modelsDir, modelId);
    }
    return null;
  }

  async deleteModel(modelId: string): Promise<void> {
    const modelDir = path.join(this.modelsDir, modelId);
    try {
      await fs.rm(modelDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`Failed to delete model ${modelId}:`, error);
    }
  }

  async getDownloadedModels(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.modelsDir, { withFileTypes: true });
      const modelIds = [];
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const isDownloaded = await this.isModelDownloaded(entry.name);
          if (isDownloaded) {
            modelIds.push(entry.name);
          }
        }
      }
      
      return modelIds;
    } catch {
      return [];
    }
  }
}

export const modelRepository = new ModelRepository();
