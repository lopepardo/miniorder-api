import type { EmailSender } from "../../application/ports/EmailSender.js";
import type { Logger } from "../../shared/Logger.js";

export function createFakeEmailSender(deps: { logger: Logger }): EmailSender {
  return {
    async send(input: { to: string; subject: string; body: string }): Promise<void> {
      deps.logger.info(
        {
          to: input.to,
          subject: input.subject,
          body: input.body,
        },
        "Fake email sent",
      );
    },
  };
}
