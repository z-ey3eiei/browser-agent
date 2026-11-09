import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession } from "@/agent/lib/private-auth";
import { AgentChat } from "@/app/_components/agent-chat";
import { Button } from "@/components/ui/button";
import { logout } from "./login/actions";

export default async function Page() {
  if (!verifySession((await cookies()).get(SESSION_COOKIE)?.value)) redirect("/login");
  return (
    <>
      <form action={logout} className="fixed right-3 top-3 z-50">
        <Button variant="outline" size="sm" type="submit">ออกจากระบบ</Button>
      </form>
      <AgentChat />
    </>
  );
}
