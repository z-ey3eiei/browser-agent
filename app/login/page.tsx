import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLoginConfigured, SESSION_COOKIE, verifySession } from "@/agent/lib/private-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (verifySession((await cookies()).get(SESSION_COOKIE)?.value)) redirect("/");
  const configured = isLoginConfigured();
  const { error } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
      <section className="w-full max-w-sm space-y-6 rounded-xl border p-6" lang="th">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">เข้าสู่ระบบส่วนตัว</h1>
          <p className="text-sm text-muted-foreground">Browser Agent สำหรับเจ้าของเท่านั้น</p>
        </div>
        {!configured ? (
          <p role="status" className="text-sm text-muted-foreground">
            ยังไม่ได้ตั้งค่าล็อกอิน กรุณาตั้ง PRIVATE_LOGIN_USERNAME และ PRIVATE_LOGIN_PASSWORD
            ใน Environment Variables ของโปรเจกต์ โดยใช้รหัสผ่านสุ่มอย่างน้อย 32 ตัวอักษร แล้ว deploy ใหม่
          </p>
        ) : (
          <form action={login} className="space-y-4">
            {error ? <p role="alert" className="text-sm text-destructive">ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง</p> : null}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm">ชื่อผู้ใช้</label>
              <Input id="username" name="username" autoComplete="username" maxLength={256} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm">รหัสผ่าน</label>
              <Input id="password" name="password" type="password" autoComplete="current-password" maxLength={1024} required />
            </div>
            <Button className="w-full" type="submit">เข้าสู่ระบบ</Button>
            <p className="text-xs text-muted-foreground">ออกจากระบบอัตโนมัติภายใน 12 ชั่วโมง</p>
          </form>
        )}
      </section>
    </main>
  );
}
