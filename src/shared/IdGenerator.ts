import { randomUUID } from "node:crypto";

export type GenerateId = () => string;

export const uuidGenerator: GenerateId = () => {
  return randomUUID();
};
