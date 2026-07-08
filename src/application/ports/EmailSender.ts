export type EmailSender = {
  send(input: { to: string; subject: string; body: string }): Promise<void>;
};
