import { eveChannel } from "eve/channels/eve";
import { type AuthFn, vercelOidc } from "eve/channels/auth";
import { sessionFromRequest } from "../lib/private-auth";

const ownerSession: AuthFn<Request> = async (request) => {
  if (!sessionFromRequest(request)) return null;
  return {
    authenticator: "private-owner",
    principalId: "owner",
    principalType: "user",
    attributes: {},
  };
};

export default eveChannel({
  // Protect session creation, follow-ups, and streaming, not just the chat page.
  // Keep Vercel OIDC for trusted internal framework calls; never accept anonymous traffic.
  auth: [ownerSession, vercelOidc()],
});
